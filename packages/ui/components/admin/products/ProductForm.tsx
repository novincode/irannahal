"use client"

import * as React from "react"
import { useForm, Control, FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productFormWithMetaSchema, ProductFormWithMetaInput } from "@actions/products/formSchema"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Textarea } from "@ui/components/ui/textarea"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@ui/components/ui/form"
import { ArrayFieldDnd } from "../shared/ArrayFieldDnd"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui/components/ui/select"
import { PostBlock } from "../shared/PostBlock"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@ui/lib/utils"
import { SortablePostBlock } from "../shared/SortablePostBlock"
import type { ProductWithDynamicRelations } from "@actions/products/types"
import { ProductCategoriesField, ProductTagsField } from "./ProductForm.fields"
import type { CategoryWithDynamicRelations } from "@actions/categories/types";
import type { TagWithDynamicRelations } from "@actions/tags/types";
import { metaRowsToObject } from '@actions/meta/utils';
import { renderBlockContent, blockTitles } from "./ProductForm.blocks";

interface ProductFormProps {
  initialData?: ProductWithDynamicRelations<{ tags: true; categories: true; downloads: true; media: true; meta: true; thumbnail: true }>
  onSubmit?: (data: any) => Promise<void> | void
  submitLabel?: string
  categories?: CategoryWithDynamicRelations[]
  allTags?: TagWithDynamicRelations[]
  allowTagCreate?: boolean
  onCreateTag?: (name: string) => Promise<TagWithDynamicRelations | void>
}

export interface ProductFormHandle {
  reset: () => void
}

const COLUMN_IDS = ["left", "right"] as const;
type ColumnId = typeof COLUMN_IDS[number];

const DEFAULT_COLUMNS = {
  left: [
    { id: "status", type: "status" },
    { id: "categories", type: "categories" },
    { id: "tags", type: "tags" },
    { id: "thumbnail", type: "thumbnail" },
  ],
  right: [
    { id: "mainInfo", type: "mainInfo" },
    { id: "meta", type: "meta" },
    { id: "infoTable", type: "infoTable" },
    { id: "attachments", type: "attachments" },
    { id: "downloads", type: "downloads" },
  ],
};

export const ProductForm = React.forwardRef<ProductFormHandle, ProductFormProps>(
  function ProductForm({
    initialData,
    onSubmit,
    submitLabel = "ثبت محصول",
    categories = [],
    allTags = [],
    allowTagCreate = false,
    onCreateTag,
  }, ref): React.ReactElement {
    // --- Normalization logic ---
    // If initialData contains relations, extract IDs for form fields, but keep objects for display
    // Always use arrays for categories/tags
    const categoriesSafe = categories ?? [];
    const allTagsSafe = allTags ?? [];
    const normalized = React.useMemo(() => {
      // Helper to extract IDs and objects from join-table or direct array
      function extractIdsAndObjects<T extends { id: any }>(arr: any[] | undefined, pivotKey: string): { ids: any[], objects: T[] } {
        if (!Array.isArray(arr)) return { ids: [], objects: [] };
        // Join-table shape: [{..., [pivotKey]: { ... }}]
        if (arr.length > 0 && arr[0][pivotKey]) {
          const objects = arr.map((item) => item[pivotKey]);
          const ids = objects.map((obj: any) => obj.id);
          return { ids, objects };
        }
        // Direct array of objects
        const objects = arr as T[];
        const ids = objects.map((obj) => obj.id);
        return { ids, objects };
      }

      if (!initialData) {
        return {
          name: '',
          slug: '',
          price: 0,
          status: 'draft',
          description: '',
          isDownloadable: false,
          categoryIds: [],
          tagIds: [],
          mediaIds: [],
          downloads: [],
          content: '',
          meta: {},
          thumbnailId: undefined,
          selectedCategories: [],
          selectedTags: [],
        };
      }
      const { ids: categoryIds, objects: selectedCategories } = extractIdsAndObjects<CategoryWithDynamicRelations>(initialData.categories, 'category');
      const { ids: tagIds, objects: selectedTags } = extractIdsAndObjects<TagWithDynamicRelations>(initialData.tags, 'tag');
      return {
        ...initialData,
        name: initialData.name ?? '',
        slug: initialData.slug ?? '',
        price: initialData.price ?? 0,
        status: initialData.status ?? 'draft',
        description: initialData.description ?? '',
        isDownloadable: initialData.isDownloadable ?? false,
        categoryIds,
        tagIds,
        mediaIds: Array.isArray(initialData.media) ? initialData.media.map((m) => m.id) : [],
        downloads: Array.isArray(initialData.downloads) ? initialData.downloads : [],
        content: initialData.content ?? '',
        meta: Array.isArray(initialData.meta)
          ? metaRowsToObject(initialData.meta.filter((r) => r.value !== null).map(({ key, value }) => ({ key, value: value as string })))
          : (initialData.meta ?? {}),
        thumbnailId: initialData.thumbnail && typeof initialData.thumbnail === 'object' ? initialData.thumbnail.id : undefined,
        selectedCategories,
        selectedTags,
      };
    }, [initialData]);

    console.log('init cats', initialData?.categories)
    const form = useForm<any>({
      resolver: zodResolver(productFormWithMetaSchema),
      defaultValues: normalized,
      mode: 'onChange',
    });

    const [loading, setLoading] = React.useState(false);

    const handleSubmit = form.handleSubmit(async (values: any) => {
      setLoading(true);
      try {
        console.log('Submitting product form:', values)
        await onSubmit?.(values);
      } finally {
        setLoading(false);
      }
    });

    const [columns, setColumns] = React.useState(DEFAULT_COLUMNS);
    const sensors = useSensors(useSensor(PointerSensor));
    const [activeBlock, setActiveBlock] = React.useState<null | { id: string; column: ColumnId }>(null);

    // Find which column a block is in
    const findColumn = (id: string): ColumnId | null => {
      for (const col of COLUMN_IDS) {
        if (columns[col].some(b => b.id === id)) return col;
      }
      return null;
    };

    // Handle drag start
    function handleDragStart(event: any) {
      const { active } = event;
      const id = String(active.id);
      const col = findColumn(id);
      if (col) setActiveBlock({ id, column: col });
    }

    // Handle drag end
    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveBlock(null);
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      const fromCol = findColumn(activeId);
      const toCol = findColumn(overId);
      if (!fromCol || !toCol) return;
      if (fromCol === toCol) {
        // Move within same column
        const oldIdx = columns[fromCol].findIndex(b => b.id === activeId);
        const newIdx = columns[toCol].findIndex(b => b.id === overId);
        setColumns(cols => ({
          ...cols,
          [fromCol]: arrayMove(cols[fromCol], oldIdx, newIdx),
        }));
      } else {
        // Move between columns
        const movingBlock = columns[fromCol].find(b => b.id === activeId);
        if (!movingBlock) return;
        setColumns(cols => {
          const fromList = cols[fromCol].filter(b => b.id !== activeId);
          const toList = [...cols[toCol]];
          const overIdx = toList.findIndex(b => b.id === overId);
          toList.splice(overIdx === -1 ? toList.length : overIdx, 0, movingBlock);
          return {
            ...cols,
            [fromCol]: fromList,
            [toCol]: toList,
          };
        });
      }
    }

    // Map selected IDs from form state to full objects for chip display
    const selectedCategoryIds = form.watch('categoryIds') || [];
    const selectedTagIds = form.watch('tagIds') || [];
    // Use normalized.selectedCategories/tags for initial display, but always sync with form state
    const selectedCategories = React.useMemo(
      () => (categoriesSafe.length > 0
        ? categoriesSafe.filter((cat: any) => selectedCategoryIds.includes(cat.id))
        : normalized.selectedCategories || []),
      [categoriesSafe, selectedCategoryIds, normalized.selectedCategories]
    );
    const selectedTags = React.useMemo(
      () => (allTagsSafe.length > 0
        ? allTagsSafe.filter((tag: any) => selectedTagIds.includes(tag.id))
        : normalized.selectedTags || []),
      [allTagsSafe, selectedTagIds, normalized.selectedTags]
    );

    return (
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col md:flex-row-reverse gap-3">
              {COLUMN_IDS.map(col => (
                <SortableContext
                  key={col}
                  items={columns[col].map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className={cn(
                      col === "left"
                        ? "md:w-[300px] w-full gap-3 flex flex-col md:sticky top-[var(--topbar-height)] self-start"
                        : "flex-auto flex flex-col gap-3",
                    )}
                  >
                    {columns[col].map(block => (
                      <SortablePostBlock
                        key={block.id}
                        id={block.id}
                        title={blockTitles[block.type] || ""}
                      >
                        {renderBlockContent(
                          block,
                          form,
                          loading,
                          submitLabel,
                          selectedCategories,
                          selectedTags
                        )}
                      </SortablePostBlock>
                    ))}
                  </div>
                </SortableContext>
              ))}
            </div>
            <DragOverlay>
              {activeBlock && (
                <PostBlock id={activeBlock.id} title="">
                  <div className="h-8" />
                </PostBlock>
              )}
            </DragOverlay>
          </DndContext>
        </form>
      </Form>
    )
  }
)
