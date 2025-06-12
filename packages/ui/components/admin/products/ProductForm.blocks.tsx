import * as React from "react"
import type { CategoryWithDynamicRelations } from "@actions/categories/types";
import type { TagWithDynamicRelations } from "@actions/tags/types";
import { CategorySelectorField } from "../shared/CategorySelectorField";
import { TagSelectorField } from "../shared/TagSelectorField";
import { ProductStatusField, ProductMainInfoFields, ProductMetaTabs, ProductInfoTableField, ProductDownloadsField, ProductAttachmentsField, ProductThumbnailField, ProductDiscountsField } from "./ProductForm.fields";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@ui/lib/utils";
import { PostBlock } from "../shared/PostBlock";
import { SortablePostBlock } from "../shared/SortablePostBlock";

export const FIELD_SPACING = "space-y-3"

const DEFAULT_FIELDS = [
  { id: "status", type: "status" },
  { id: "categories", type: "categories" },
  { id: "tags", type: "tags" },
  { id: "thumbnail", type: "thumbnail" },
  { id: "mainInfo", type: "mainInfo" },
  { id: "meta", type: "meta" },
  { id: "infoTable", type: "infoTable" },
  { id: "discounts", type: "discounts" },
  { id: "attachments", type: "attachments" },
  { id: "downloads", type: "downloads" },
];

export const blockTitles: Record<string, string> = {
  status: "وضعیت انتشار",
  tags: "برچسب‌ها",
  mainInfo: "اطلاعات کلی",
  meta: "ویژگی‌های محصول",
  infoTable: "مشخصات فنی / اطلاعات بیشتر",
  discounts: "تخفیفات کمیتی",
  attachments: "دانلودهای رایگان",
  downloads: "دانلودهای پس از خرید",
  thumbnail: "تصویر شاخص",
  categories: "دسته‌بندی‌ها",
};

export function renderBlockContent(
  block: any,
  form: any,
  loading?: boolean,
  submitLabel?: string,

  selectedCategories?: any[],
  selectedTags?: any[]
) {
  // Defensive: always provide arrays, never undefined
  const categoryIds = form?.watch?.("categoryIds") ?? [];
  const tagIds = form?.watch?.("tagIds") ?? [];
  switch (block.type) {
    case "status":
      return <ProductStatusField control={form?.control} loading={!!loading} submitLabel={submitLabel || "ثبت محصول"} />;
    case "categories":
      return (
        <CategorySelectorField
          value={categoryIds}
          onChange={val => form?.setValue?.("categoryIds", val, { shouldDirty: true })}
          disabled={!!loading}
          selectedObjects={selectedCategories || []}
        />
      );
    case "tags":
      return (
        <TagSelectorField
          value={tagIds}
          onChange={val => form?.setValue?.("tagIds", val, { shouldDirty: true })}
          disabled={!!loading}
          selectedObjects={selectedTags || []}
        />
      );
    case "mainInfo":
      return <ProductMainInfoFields control={form?.control} />;
    case "meta":
      return <ProductMetaTabs control={form?.control} />;
    case "infoTable":
      return <ProductInfoTableField control={form?.control} />;
    case "discounts":
      return <ProductDiscountsField control={form?.control} />;
    case "downloads":
      return <ProductDownloadsField control={form?.control} form={form} />;
    case "attachments":
      return <ProductAttachmentsField form={form} />;
    case "thumbnail":
      return <ProductThumbnailField form={form} />;
    default:
      return null;
  }
}

export function ProductFormFields({
  form,
  loading,
  submitLabel,
  allCategories,
  allTags,
  allowTagCreate,
  onCreateTag,
  selectedCategories,
  selectedTags,
}: {
  form: any,
  loading?: boolean,
  submitLabel?: string,
  allCategories: any[],
  allTags: any[],
  allowTagCreate?: boolean,
  onCreateTag?: (name: string) => Promise<any>,
  selectedCategories: any[],
  selectedTags: any[],
}) {
  const [fields, setFields] = React.useState(DEFAULT_FIELDS);
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeField, setActiveField] = React.useState<null | { id: string }>(null);

  function handleDragStart(event: any) {
    const { active } = event;
    setActiveField({ id: String(active.id) });
  }
  function handleDragEnd(event: DragEndEvent) {
    setActiveField(null);
    const { active, over } = event;
    if (!over) return;
    const oldIdx = fields.findIndex(f => f.id === String(active.id));
    const newIdx = fields.findIndex(f => f.id === String(over.id));
    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      setFields(f => arrayMove(f, oldIdx, newIdx));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {fields.map(field => (
            <SortablePostBlock
              key={field.id}
              id={field.id}
              title={blockTitles[field.type] || ""}
            >
              {renderBlockContent(
                field,
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
      <DragOverlay>
        {activeField && (
          <div>
            <PostBlock id={activeField.id} title="">
              <div className="h-8" />
            </PostBlock>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
