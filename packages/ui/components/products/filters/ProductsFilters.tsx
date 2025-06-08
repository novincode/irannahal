"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@ui/components/ui/input"
import { Button } from "@ui/components/ui/button"
import { Label } from "@ui/components/ui/label"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Slider } from "@ui/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui/components/ui/accordion"
import { ScrollArea } from "@ui/components/ui/scroll-area"
import { Badge } from "@ui/components/ui/badge"
import type { ProductFilterParams, AvailableFilters } from "@actions/products/types"

interface ProductsFiltersProps {
  filters: ProductFilterParams
  availableFilters: AvailableFilters
  onFiltersChange: (filters: ProductFilterParams) => void
  className?: string
}

export function ProductsFilters({ 
  filters, 
  availableFilters, 
  onFiltersChange,
  className 
}: ProductsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const [tagSearchValue, setTagSearchValue] = useState("")
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || availableFilters.priceRange.min,
    filters.maxPrice || availableFilters.priceRange.max
  ])

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!tagSearchValue.trim()) return availableFilters.tags.slice(0, 20) // Show first 20 by default
    return availableFilters.tags.filter(tag => 
      tag.name.toLowerCase().includes(tagSearchValue.toLowerCase())
    )
  }, [availableFilters.tags, tagSearchValue])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: searchValue, page: 1 })
  }

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    const currentCategories = filters.categories || []
    let newCategories: string[]
    
    if (checked) {
      // Add category (max 3)
      if (currentCategories.length < 3) {
        newCategories = [...currentCategories, categorySlug]
      } else {
        newCategories = currentCategories
      }
    } else {
      // Remove category
      newCategories = currentCategories.filter(c => c !== categorySlug)
    }
    
    onFiltersChange({ ...filters, categories: newCategories, page: 1 })
  }

  const handleTagChange = (tagSlug: string, checked: boolean) => {
    const currentTags = filters.tags || []
    let newTags: string[]
    
    if (checked) {
      newTags = [...currentTags, tagSlug]
    } else {
      newTags = currentTags.filter(t => t !== tagSlug)
    }
    
    onFiltersChange({ ...filters, tags: newTags, page: 1 })
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    onFiltersChange({ 
      ...filters, 
      minPrice: values[0], 
      maxPrice: values[1],
      page: 1 
    })
  }

  const handleDownloadableChange = (checked: boolean) => {
    onFiltersChange({ 
      ...filters, 
      isDownloadable: checked ? true : undefined,
      page: 1 
    })
  }

  const clearAllFilters = () => {
    setSearchValue("")
    setTagSearchValue("")
    setPriceRange([availableFilters.priceRange.min, availableFilters.priceRange.max])
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy
    })
  }

  const hasActiveFilters = !!(
    filters.search ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.isDownloadable !== undefined
  )

  // Remove specific tag
  const removeTag = (tagId: string) => {
    handleTagChange(tagId, false)
  }

  // Remove specific category
  const removeCategory = (categoryId: string) => {
    handleCategoryChange(categoryId, false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">فیلترهای فعال</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className="gap-2"
          >
            <X className="w-3 h-3" />
            پاک کردن همه
          </Button>
        </div>
      )}

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {/* Search Badge */}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              جستجو: {filters.search}
              <X 
                className="w-3 h-3 cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-full" 
                onClick={() => {
                  setSearchValue("")
                  onFiltersChange({ ...filters, search: undefined, page: 1 })
                }}
              />
            </Badge>
          )}
          
          {/* Category Badges */}
          {filters.categories?.map((categoryId) => {
            const category = availableFilters.categories.find(c => c.id === categoryId)
            return category ? (
              <Badge key={categoryId} variant="secondary" className="gap-1">
                {category.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-full" 
                  onClick={() => removeCategory(categoryId)}
                />
              </Badge>
            ) : null
          })}
          
          {/* Tag Badges */}
          {filters.tags?.map((tagId) => {
            const tag = availableFilters.tags.find(t => t.id === tagId)
            return tag ? (
              <Badge key={tagId} variant="secondary" className="gap-1">
                {tag.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-full" 
                  onClick={() => removeTag(tagId)}
                />
              </Badge>
            ) : null
          })}
          
          {/* Price Range Badge */}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <Badge variant="secondary" className="gap-1">
              قیمت: {(filters.minPrice || availableFilters.priceRange.min).toLocaleString()} - {(filters.maxPrice || availableFilters.priceRange.max).toLocaleString()} تومان
              <X 
                className="w-3 h-3 cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-full" 
                onClick={() => {
                  setPriceRange([availableFilters.priceRange.min, availableFilters.priceRange.max])
                  onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined, page: 1 })
                }}
              />
            </Badge>
          )}
          
          {/* Downloadable Badge */}
          {filters.isDownloadable && (
            <Badge variant="secondary" className="gap-1">
              قابل دانلود
              <X 
                className="w-3 h-3 cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-full" 
                onClick={() => handleDownloadableChange(false)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Accordion */}
      <Accordion type="multiple" defaultValue={["search"]} className="w-full">
        {/* Price Range - Top Priority */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">
            محدوده قیمت
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* Price range slider */}
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                min={availableFilters.priceRange.min}
                max={availableFilters.priceRange.max}
                step={1000}
                className="w-full"
              />
            </div>
            
            {/* Price range display */}
            <div className="text-xs text-muted-foreground text-center">
              {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} تومان
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Search */}
        <AccordionItem value="search">
          <AccordionTrigger className="text-sm font-medium">
            جستجو
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در محصولات..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pr-10"
              />
            </form>
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        {availableFilters.categories.length > 0 && (
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm font-medium">
              دسته‌بندی‌ها
              {filters.categories && filters.categories.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {filters.categories.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <ScrollArea className="h-48">
                <div className="space-y-3 pr-2">
                  {availableFilters.categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.categories?.includes(category.id) || false}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category.id, !!checked)
                        }
                      />
                      <Label 
                        htmlFor={`category-${category.id}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {category.name}
                        <span className="text-muted-foreground mr-1">
                          ({category.count})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Max categories warning */}
              {(filters.categories?.length || 0) >= 3 && (
                <p className="text-xs text-muted-foreground">
                  حداکثر 3 دسته‌بندی می‌توانید انتخاب کنید
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Tags */}
        {availableFilters.tags.length > 0 && (
          <AccordionItem value="tags">
            <AccordionTrigger className="text-sm font-medium">
              برچسب‌ها
              {filters.tags && filters.tags.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {filters.tags.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              {/* Tag Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو و انتخاب برچسب..."
                  value={tagSearchValue}
                  onChange={(e) => setTagSearchValue(e.target.value)}
                  className="pr-10 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const matchedTag = filteredTags.find(tag => 
                        tag.name.toLowerCase() === tagSearchValue.toLowerCase()
                      )
                      if (matchedTag && !filters.tags?.includes(matchedTag.id)) {
                        handleTagChange(matchedTag.id, true)
                        setTagSearchValue("")
                      }
                    }
                  }}
                />
              </div>
              
              {/* Tag suggestions */}
              {tagSearchValue && filteredTags.length > 0 && (
                <div className="space-y-2">
                  {filteredTags.slice(0, 5).map((tag) => (
                    <div 
                      key={tag.id} 
                      className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => {
                        if (!filters.tags?.includes(tag.id)) {
                          handleTagChange(tag.id, true)
                          setTagSearchValue("")
                        }
                      }}
                    >
                      <span className="text-sm">{tag.name}</span>
                      <span className="text-xs text-muted-foreground">({tag.count})</span>
                    </div>
                  ))}
                </div>
              )}
              
              {tagSearchValue && filteredTags.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  برچسبی یافت نشد
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Features */}
        <AccordionItem value="features">
          <AccordionTrigger className="text-sm font-medium">
            ویژگی‌ها
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {/* Downloadable filter */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="downloadable"
                checked={filters.isDownloadable === true}
                onCheckedChange={handleDownloadableChange}
              />
              <Label htmlFor="downloadable" className="text-sm cursor-pointer">
                محصولات قابل دانلود
                {availableFilters.productCount?.downloadable !== undefined && (
                  <span className="text-muted-foreground mr-1">
                    ({availableFilters.productCount.downloadable})
                  </span>
                )}
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
