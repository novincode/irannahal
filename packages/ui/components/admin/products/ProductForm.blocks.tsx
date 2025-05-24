import * as React from "react"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Textarea } from "@ui/components/ui/textarea"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@ui/components/ui/form"
import { ArrayFieldDnd } from "./ArrayFieldDnd"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui/components/ui/select"
import { Control } from "react-hook-form"
import { ProductFormWithMetaInput } from "@actions/products/formSchema"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ui/components/ui/tabs"
import { Switch } from "@ui/components/ui/switch"
import { DownloadFilesField } from "./DownloadFilesField"
import { AttachmentFilesField } from "./DownloadFilesField"
import { ThumbnailSelectorField } from "./ThumbnailSelectorField"

export const FIELD_SPACING = "space-y-3"

export const blockTitles: Record<string, string> = {
  status: "وضعیت انتشار",
  tags: "برچسب‌ها",
  mainInfo: "اطلاعات کلی",
  meta: "ویژگی‌های محصول",
  infoTable: "مشخصات فنی / اطلاعات بیشتر",
  attachments: "دانلودهای رایگان",
  downloads: "دانلودهای پس از خرید",
  thumbnail: "تصویر شاخص",
}

// This function must be passed form as a closure or context in the main file
export function renderBlockContent(block: any, form: any, loading?: boolean, submitLabel?: string) {
  switch (block.type) {
    case "status":
      return (
        <div className={FIELD_SPACING}>
          <FormField<ProductFormWithMetaInput>
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وضعیت</FormLabel>
                <FormControl>
                  <Select 
                    dir="rtl" 
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value || "draft"}
                  >
                    <SelectTrigger className="border rounded px-2 py-1 w-full">
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">پیش‌نویس</SelectItem>
                      <SelectItem value="active">فعال</SelectItem>
                      <SelectItem value="inactive">غیرفعال</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "در حال ثبت..." : submitLabel}
          </Button>
        </div>
      )
    case "tags":
      return (
        <FormField<ProductFormWithMetaInput>
          control={form.control}
          name="meta.flags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>برچسب‌ها</FormLabel>
              <FormControl>
                <select multiple {...field} className="border rounded px-2 py-1">
                  <option value="new">جدید</option>
                  <option value="exclusive">انحصاری</option>
                  <option value="eco">سازگار با محیط زیست</option>
                  <option value="bestseller">پرفروش</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    case "mainInfo":
      return (
        <div className={FIELD_SPACING}>
          <FormField<ProductFormWithMetaInput>
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام محصول</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField<ProductFormWithMetaInput>
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسلاگ</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField<ProductFormWithMetaInput>
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>توضیحات</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    case "meta":
      return (
        <Tabs dir="rtl" defaultValue="general" orientation="vertical" className="flex flex-col md:flex-row w-full">
          <TabsList className="flex md:flex-col min-w-[140px] gap-1 bg-transparent border-none h-auto self-start items-stretch">
            <TabsTrigger value="general">عمومی</TabsTrigger>
            <TabsTrigger value="dimensions">ابعاد و وزن</TabsTrigger>
            <TabsTrigger value="warranty">گارانتی و ارسال</TabsTrigger>
            <TabsTrigger value="flags">سایر</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="flex-1">
            <div className={FIELD_SPACING}>
             
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>قیمت</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="meta.brand" render={({ field }) => (
                <FormItem>
                  <FormLabel>برند</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="meta.model" render={({ field }) => (
                <FormItem>
                  <FormLabel>مدل</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="meta.sku" render={({ field }) => (
                <FormItem>
                  <FormLabel>کد SKU</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="meta.barcode" render={({ field }) => (
                <FormItem>
                  <FormLabel>بارکد</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="meta.customBadge" render={({ field }) => (
                <FormItem>
                  <FormLabel>نشان سفارشی</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </TabsContent>
          <TabsContent value="dimensions" className="flex-1">
            <div className={FIELD_SPACING}>
              <div className="flex gap-2">
                <FormField control={form.control} name="meta.dimensions.width" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>عرض (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="meta.dimensions.height" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>ارتفاع (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="meta.dimensions.depth" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>عمق (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="meta.weight" render={({ field }) => (
                <FormItem>
                  <FormLabel>وزن (گرم)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </TabsContent>
          <TabsContent value="warranty" className="flex-1">
            <div className={FIELD_SPACING}>
              <FormField control={form.control} name="meta.warranty" render={({ field }) => (
                <FormItem>
                  <FormLabel>گارانتی</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="meta.shippingTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>زمان ارسال</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </TabsContent>
          <TabsContent value="flags" className="flex-1">
            <div className={FIELD_SPACING}>
              <FormField control={form.control} name="meta.isLimited" render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="mb-0">سری محدود؟</FormLabel>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </TabsContent>
        </Tabs>
      )
    case "infoTable":
      return (
        <FormField<ProductFormWithMetaInput>
          control={form.control}
          name="meta.infoTable"
          render={() => (
            <ArrayFieldDnd<ProductFormWithMetaInput>
              control={form.control}
              name="meta.infoTable"
              emptyItem={() => ({ label: "", value: "" })}
              renderItem={(_item, idx, { remove, field, dragHandleProps }) => (
                <div className="flex gap-2 items-center mb-2">
                  <span {...dragHandleProps} className="cursor-grab">☰</span>
                  <Input {...form.register(`meta.infoTable.${idx}.label`)} placeholder="برچسب" className="flex-1" />
                  <Input {...form.register(`meta.infoTable.${idx}.value`)} placeholder="مقدار" className="flex-1" />
                  <Button type="button" variant="destructive" size="sm" onClick={remove}>حذف</Button>
                </div>
              )}
              addLabel="افزودن ردیف"
            />
          )}
        />
      )
    case "downloads": {
      // Move isDownloadable switch above downloads, and only show downloads if checked
      return (
        <>
          <FormField<ProductFormWithMetaInput>
            control={form.control}
            name="isDownloadable"
            render={({ field }) => (
              <div className="flex items-center gap-2 mb-2">
                <Switch checked={field.value} onCheckedChange={field.onChange} id="isDownloadable-switch" />
                <label htmlFor="isDownloadable-switch" className="text-sm font-medium select-none cursor-pointer">دانلودی است؟</label>
              </div>
            )}
          />
          {form.watch("isDownloadable") && (
            <DownloadFilesField
              name="downloads"
              form={form}
              addLabel="افزودن فایل پس از خرید"
              showLimitSwitch={true}
            />
          )}
        </>
      )
    }
    case "attachments":
      return (
        <AttachmentFilesField
          name="meta.attachments"
          addLabel="افزودن فایل رایگان"
          form={form}
        />
      )
    case "thumbnail":
      // Thumbnail selector field using MediaDialog
      return (
        <ThumbnailSelectorField form={form} />
      )
    default:
      return null
  }
}
