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
import { ArrayFieldDnd } from "./ArrayFieldDnd"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui/components/ui/select"
import { PostBlock } from "../PostBlock"
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
import { SortablePostBlock } from "./SortablePostBlock"

interface ProductFormProps {
  initialData?: Partial<ProductFormWithMetaInput>
  onSubmit?: (data: ProductFormWithMetaInput) => Promise<void> | void
  submitLabel?: string
}

export interface ProductFormHandle {
  reset: () => void
}

const COLUMN_IDS = ["left", "right"] as const;
type ColumnId = typeof COLUMN_IDS[number];

const DEFAULT_COLUMNS = {
  left: [
    { id: "status", type: "status" },
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
  }, ref): React.ReactElement {
    const form = useForm<ProductFormWithMetaInput>({
      resolver: zodResolver(productFormWithMetaSchema),
      defaultValues: {
        name: "",
        slug: "",
        description: "",
        price: 0,
        status: "draft",
        isDownloadable: false,
        categoryIds: [],
        tagIds: [],
        mediaIds: [],
        downloads: [],
        content: "",
        meta: {
          brand: "",
          model: "",
          sku: "",
          barcode: "",
          warranty: "",
          shippingTime: "",
          weight: undefined,
          dimensions: { width: undefined, height: undefined, depth: undefined },
          isLimited: false,
          customBadge: "",
          flags: [],
          infoTable: [],
          attachments: [],
          customJson: {},
          ...initialData?.meta,
        },
        ...initialData,
      },
      mode: "onChange",
    })

    React.useImperativeHandle(ref, () => ({
      reset: () => form.reset({
        name: "",
        slug: "",
        description: "",
        price: 0,
        status: "draft",
        isDownloadable: false,
        categoryIds: [],
        tagIds: [],
        mediaIds: [],
        downloads: [],
        content: "",
        meta: {
          brand: "",
          model: "",
          sku: "",
          barcode: "",
          warranty: "",
          shippingTime: "",
          weight: undefined,
          dimensions: { width: undefined, height: undefined, depth: undefined },
          isLimited: false,
          customBadge: "",
          flags: [],
          infoTable: [],
          attachments: [],
          customJson: {},
          ...initialData?.meta,
        },
        ...initialData,
      })
    }), [form, initialData])

    const [loading, setLoading] = React.useState(false)

    const handleSubmit = form.handleSubmit(async (values) => {
      setLoading(true)
      try {
        await onSubmit?.(values)
        // Do not reset here; let parent handle it
      } finally {
        setLoading(false)
      }
    })

    const [columns, setColumns] = React.useState(DEFAULT_COLUMNS)
    const sensors = useSensors(useSensor(PointerSensor))
    const [activeBlock, setActiveBlock] = React.useState<null | { id: string; column: ColumnId }>(null)

    // Find which column a block is in
    const findColumn = (id: string): ColumnId | null => {
      for (const col of COLUMN_IDS) {
        if (columns[col].some(b => b.id === id)) return col
      }
      return null
    }

    // Handle drag start
    function handleDragStart(event: any) {
      const { active } = event
      const id = String(active.id)
      const col = findColumn(id)
      if (col) setActiveBlock({ id, column: col })
    }

    // Handle drag end
    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event
      setActiveBlock(null)
      if (!over) return
      const activeId = String(active.id)
      const overId = String(over.id)
      const fromCol = findColumn(activeId)
      const toCol = findColumn(overId)
      if (!fromCol || !toCol) return
      if (fromCol === toCol) {
        // Move within same column
        const oldIdx = columns[fromCol].findIndex(b => b.id === activeId)
        const newIdx = columns[toCol].findIndex(b => b.id === overId)
        setColumns(cols => ({
          ...cols,
          [fromCol]: arrayMove(cols[fromCol], oldIdx, newIdx),
        }))
      } else {
        // Move between columns
        const movingBlock = columns[fromCol].find(b => b.id === activeId)
        if (!movingBlock) return
        setColumns(cols => {
          const fromList = cols[fromCol].filter(b => b.id !== activeId)
          const toList = [...cols[toCol]]
          const overIdx = toList.findIndex(b => b.id === overId)
          toList.splice(overIdx === -1 ? toList.length : overIdx, 0, movingBlock)
          return {
            ...cols,
            [fromCol]: fromList,
            [toCol]: toList,
          }
        })
      }
    }

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
                      <SortablePostBlock key={block.id} block={block} column={col} form={form} loading={loading} submitLabel={submitLabel} />
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
