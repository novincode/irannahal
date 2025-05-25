import * as React from "react"
import { Checkbox } from "@ui/components/ui/checkbox"
import { cn } from "@ui/lib/utils"
import { getCategories } from "@actions/categories/get"
import { Badge } from "@ui/components/ui/badge"
import { ScrollArea } from "@ui/components/ui/scroll-area"
import { createCategory } from "@actions/categories/create"
import { slugify } from "@ui/lib/slug"
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty,
    CommandGroup
} from "@ui/components/ui/command"

export interface CategoryNode {
    id: string
    name: string
    parentId?: string | null
    children?: CategoryNode[]
}

interface CategorySelectorFieldProps {
    categories?: CategoryNode[]
    value: string[] // Important: This must be an array of strings (category IDs)
    onChange: (ids: string[]) => void
    label?: string
    disabled?: boolean
    className?: string
    selectedObjects?: CategoryNode[]
}

// Helper: build tree from flat list
function buildCategoryTree(categories: CategoryNode[]): CategoryNode[] {
    const map = new Map<string, CategoryNode & { children: CategoryNode[] }>()
    categories.forEach(cat => map.set(cat.id, { ...cat, children: [] }))
    const roots: CategoryNode[] = []

    map.forEach(cat => {
        if (cat.parentId && map.has(cat.parentId)) {
            map.get(cat.parentId)!.children.push(cat)
        } else {
            roots.push(cat)
        }
    })

    return roots
}

export function CategorySelectorField({
    categories: categoriesProp,
    value = [], // Default to empty array to avoid null/undefined issues
    onChange,
    disabled = false,
    className,
    selectedObjects
}: CategorySelectorFieldProps) {
    // Keep track of all available categories
    const [allCategories, setAllCategories] = React.useState<CategoryNode[]>(categoriesProp || [])

    // Track if we've loaded categories from the server
    const hasLoadedRef = React.useRef(false)

    // Load categories from server if not provided
    React.useEffect(() => {
        const loadCategories = async () => {
            if ((!categoriesProp || categoriesProp.length === 0) && !hasLoadedRef.current) {
                hasLoadedRef.current = true
                try {
                    const fetchedCategories = await getCategories()
                    setAllCategories(fetchedCategories)
                    console.log('Loaded categories:', fetchedCategories)
                } catch (err) {
                    console.error('Failed to load categories:', err)
                }
            }
        }

        loadCategories()
    }, [])

    // Update categories if prop changes
    React.useEffect(() => {
        if (categoriesProp && categoriesProp.length > 0) {
            setAllCategories(categoriesProp)
        }
    }, [categoriesProp])

    // Safe set of selected category IDs
    const selected = React.useMemo(() => {
        // Ensure value is an array of strings
        const safeValue = Array.isArray(value) ? value : []
        console.log('Category selected IDs:', safeValue)
        return new Set(safeValue)
    }, [value])

    // Calculate the tree structure once
    const tree = React.useMemo(() => buildCategoryTree(allCategories), [allCategories])

    // Handle checking/unchecking categories
    const handleToggle = (id: string, checked: boolean) => {
        console.log(`Toggle category: ${id}, checked: ${checked}`)

        // Get current selection as an array
        const currentSelection = Array.isArray(value) ? [...value] : []

        // Update selection
        let newSelection: string[]
        if (checked) {
            // Add to selection if not already included
            newSelection = currentSelection.includes(id)
                ? currentSelection
                : [...currentSelection, id]
        } else {
            // Remove from selection
            newSelection = currentSelection.filter(categoryId => categoryId !== id)
        }

        // Debug the change
        console.log('Category selection changed:', {
            previous: currentSelection,
            new: newSelection
        })

        // Call the onChange callback with new selection
        onChange(newSelection)
    }

    // Show selected categories as chips
    const selectedCategories = React.useMemo(() => {
        // Always derive from current selection for live reactivity
        return allCategories.filter(cat => selected.has(cat.id))
    }, [allCategories, selected])

    // State for search/create
    const [input, setInput] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<CategoryNode[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [isCreating, setIsCreating] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Debounced search for categories
    React.useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!input.trim()) {
                setSearchResults([])
                return
            }
            setIsLoading(true)
            setError(null)
            try {
                // Simple client-side search for now
                const results = allCategories.filter(cat => cat.name.includes(input.trim()))
                setSearchResults(results)
            } catch (err) {
                setError('خطا در جستجوی دسته‌بندی‌ها')
            } finally {
                setIsLoading(false)
            }
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [input, allCategories])

    // Add a category to the selection
    const handleAddCategory = (cat: CategoryNode) => {
        if (!selected.has(cat.id)) {
            onChange([...value, cat.id])
            if (!allCategories.some(c => c.id === cat.id)) {
                setAllCategories(prev => [...prev, cat])
            }
        }
        setInput("")
    }

    // Create a new category from the current input
    const handleCreateCategory = async () => {
        const name = input.trim()
        if (!name) return
        setIsCreating(true)
        setError(null)
        try {
            // Check if category already exists by name
            const existingCat = allCategories.find(c => c.name === name)
            if (existingCat) {
                handleAddCategory(existingCat)
                setInput("")
                return
            }
            // Create new category
            const slug = slugify(name)
            const newCat = await createCategory({ name, slug })
            if (newCat && newCat.id) {
                handleAddCategory(newCat)
            }
        } catch (err) {
            setError('خطا در ایجاد دسته‌بندی جدید')
        } finally {
            setIsCreating(false)
            setInput("")
        }
    }

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim() && !isCreating) {
            e.preventDefault()
            handleCreateCategory()
        }
    }

    // Render the category tree recursively with checkboxes
    const renderTree = (nodes: CategoryNode[], level = 0) => {
        return nodes.map(node => (
            <div
                key={node.id}
                className={cn(
                    "flex flex-col",
                    level > 0 && "pl-4 border-r border-muted/30",
                    "mb-2",
                    level > 0 && "px-2" // Add px-2 to every child (level > 0)
                )}
            >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                        id={`category-${node.id}`}
                        checked={selected.has(node.id)}
                        onCheckedChange={(checked) => handleToggle(node.id, !!checked)}
                        disabled={disabled}
                    />
                    <span>{node.name}</span>
                </label>

                {node.children && node.children.length > 0 && (
                    <div className="mt-1">
                        {renderTree(node.children, level + 1)}
                    </div>
                )}
            </div>
        ))
    }

    return (
        <div className="space-y-4">
            {/* Selected categories as badges */}
            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(cat => (
                        <Badge
                            key={cat.id}
                            className="text-xs cursor-pointer"
                            variant="secondary"
                            onClick={() => handleToggle(cat.id, false)}
                        >
                            {cat.name}
                            <span className="ml-1.5 opacity-70">×</span>
                        </Badge>
                    ))}
                </div>
            )}
            {/* Category search & creation using shadcn Command */}
            <Command className="rounded-md border mb-2">
                <CommandInput
                    placeholder="جستجو یا ایجاد دسته‌بندی..."
                    value={input}
                    onValueChange={setInput}
                    onKeyDown={handleKeyDown}
                    disabled={isCreating || isLoading}
                    className="text-sm"
                />
                {error && <div className="px-3 py-2 text-sm text-red-500">{error}</div>}
                <CommandList className="max-h-64">
                    {isLoading && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">در حال جستجو...</div>
                    )}
                    {!isLoading && input.trim() && searchResults.length === 0 && (
                        <CommandEmpty>
                            <div className="px-1 py-2 text-sm">
                                <div>دسته‌بندی‌ای یافت نشد.</div>
                                <div className="mt-1">
                                    <button
                                        onClick={handleCreateCategory}
                                        disabled={isCreating}
                                        className="text-primary hover:underline"
                                    >
                                        ایجاد دسته‌بندی "{input}"
                                    </button>
                                </div>
                            </div>
                        </CommandEmpty>
                    )}
                    {searchResults.length > 0 && (
                        <CommandGroup>
                            {searchResults.map(cat => (
                                <CommandItem
                                    key={cat.id}
                                    onSelect={() => handleAddCategory(cat)}
                                    disabled={selected.has(cat.id)}
                                    className={cn(
                                        "text-sm cursor-pointer",
                                        selected.has(cat.id) && "opacity-50"
                                    )}
                                >
                                    {cat.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {!isLoading && input.trim() && searchResults.length > 0 && !searchResults.some(c => c.name === input.trim()) && (
                        <div className="px-3 py-2 border-t">
                            <button
                                onClick={handleCreateCategory}
                                disabled={isCreating}
                                className="text-sm text-primary hover:underline"
                            >
                                ایجاد دسته‌بندی جدید: "{input}"
                            </button>
                        </div>
                    )}
                </CommandList>
            </Command>
            {/* Category tree with checkboxes, now using shadcn ScrollArea */}
            <ScrollArea className="h-[200px] p-2 border rounded-md">
                {tree.length > 0 ? (
                    renderTree(tree)
                ) : (
                    <div className="text-sm text-muted-foreground py-2">
                        در حال بارگذاری دسته‌بندی‌ها...
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
