import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Controller } from "react-hook-form"
import { CategorySelectorField, TagSelectorField } from "../shared"
import { ProductFormWithMetaInput } from "@actions/products/formSchema"
import type { CategoryWithDynamicRelations } from "@actions/categories/types";
import type { TagWithDynamicRelations } from "@actions/tags/types";
import { Input } from "@ui/components/ui/input"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Textarea } from "@ui/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ui/components/ui/tabs"
import { Switch } from "@ui/components/ui/switch"
import { DownloadFilesField } from "../shared/DownloadFilesField"
import { AttachmentFilesField } from "../shared/DownloadFilesField"
import { ThumbnailSelectorField } from "../shared/ThumbnailSelectorField"
import { Button } from "@ui/components/ui/button"
import { ArrayFieldDnd } from "../shared/ArrayFieldDnd"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card"
import { Badge } from "@ui/components/ui/badge"
import { Separator } from "@ui/components/ui/separator"
import { Trash2, Calculator, Percent, DollarSign, AlertCircle, GripVertical } from "lucide-react"
import { Alert, AlertDescription } from "@ui/components/ui/alert"

export function ProductCategoriesField({
  categories,
  control,
  disabled = false,
  selectedCategories = [],
}: {
  categories: CategoryWithDynamicRelations[]
  control: any
  disabled?: boolean
  selectedCategories?: CategoryWithDynamicRelations[]
}) {
  return (
    <FormField<ProductFormWithMetaInput>
      control={control}
      name="categoryIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel>دسته‌بندی‌ها</FormLabel>
          <FormControl>
            <CategorySelectorField
              categories={categories}
              value={field.value || []}
              onChange={field.onChange}
              disabled={disabled}
              selectedObjects={selectedCategories}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function ProductTagsField({
  allTags,
  control,
  disabled = false,
  allowCreate = false,
  onCreateTag,
  selectedTags = [],
}: {
  allTags: TagWithDynamicRelations[]
  control: any
  disabled?: boolean
  allowCreate?: boolean
  onCreateTag?: (name: string) => Promise<TagWithDynamicRelations | void>
  selectedTags?: TagWithDynamicRelations[]
}) {
  return (
    <FormField<ProductFormWithMetaInput>
      control={control}
      name="tagIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel>برچسب‌ها</FormLabel>
          <FormControl>
            <TagSelectorField
              value={field.value || []}
              onChange={field.onChange}
              disabled={disabled}
              allowCreate={allowCreate}
              selectedObjects={selectedTags}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function ProductStatusField({ control, loading, submitLabel }: { control: any, loading?: boolean, submitLabel?: string }) {
  return (
    <div className="space-y-3">
      <FormField control={control} name="status" render={({ field }) => (
        <FormItem>
          <FormLabel>وضعیت</FormLabel>
          <FormControl>
            <Select dir="rtl" onValueChange={field.onChange} value={field.value} defaultValue={field.value || "draft"}>
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
      )} />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "در حال ثبت..." : submitLabel}
      </Button>
    </div>
  )
}

export function ProductMainInfoFields({ control }: { control: any }) {
  return (
    <div className="space-y-3">
      <FormField control={control} name="name" render={({ field }) => (
        <FormItem>
          <FormLabel>نام محصول</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={control} name="slug" render={({ field }) => (
        <FormItem>
          <FormLabel>اسلاگ</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={control} name="description" render={({ field }) => (
        <FormItem>
          <FormLabel>توضیحات</FormLabel>
          <FormControl><Textarea {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  )
}

export function ProductMetaTabs({ control }: { control: any }) {
  return (
    <Tabs dir="rtl" defaultValue="general" orientation="vertical" className="flex flex-col md:flex-row w-full">
      <TabsList className="flex md:flex-col min-w-[140px] gap-1 bg-transparent border-none h-auto self-start items-stretch">
        <TabsTrigger value="general">عمومی</TabsTrigger>
        <TabsTrigger value="dimensions">ابعاد و وزن</TabsTrigger>
        <TabsTrigger value="warranty">گارانتی و ارسال</TabsTrigger>
        <TabsTrigger value="discounts">تخفیفات</TabsTrigger>
        <TabsTrigger value="flags">سایر</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="flex-1">
        <div className="space-y-3">
          <FormField control={control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="meta.priceBeforeOffer" render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت قبل از تخفیف (اختیاری)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} 
                  placeholder="برای نمایش تخفیف وارد کنید"
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                اگر وارد کنید، قیمت اصلی با خط خورده نمایش داده می‌شود
              </p>
            </FormItem>
          )} />
          <FormField control={control} name="meta.brand" render={({ field }) => (
            <FormItem>
              <FormLabel>برند</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="meta.model" render={({ field }) => (
            <FormItem>
              <FormLabel>مدل</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="meta.sku" render={({ field }) => (
            <FormItem>
              <FormLabel>کد SKU</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="meta.barcode" render={({ field }) => (
            <FormItem>
              <FormLabel>بارکد</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="meta.customBadge" render={({ field }) => (
            <FormItem>
              <FormLabel>نشان سفارشی</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
      </TabsContent>
      <TabsContent value="dimensions" className="flex-1">
        <div className="space-y-3">
          <div className="flex gap-2">
            <FormField control={control} name="meta.dimensions.width" render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>عرض (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={control} name="meta.dimensions.height" render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>ارتفاع (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={control} name="meta.dimensions.depth" render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>عمق (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={control} name="meta.weight" render={({ field }) => (
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
        <div className="space-y-3">
          <FormField control={control} name="meta.warranty" render={({ field }) => (
            <FormItem>
              <FormLabel>گارانتی</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="meta.shippingTime" render={({ field }) => (
            <FormItem>
              <FormLabel>زمان ارسال</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
      </TabsContent>
      <TabsContent value="discounts" className="flex-1">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            <p>تخفیفات کمیتی: براساس تعداد خریداری شده، تخفیف اعمال می‌شود.</p>
          </div>
          
          <FormField control={control} name="meta.discountConditions" render={() => (
            <div className="space-y-4">
              <ArrayFieldDnd
                control={control}
                name="meta.discountConditions"
                emptyItem={() => ({ minQuantity: 1, type: "percentage", value: 0 })}
                renderItem={(item, idx, { remove, field, dragHandleProps }) => (
                  <Card className="relative">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        شرط تخفیف #{idx + 1}
                        <Badge variant="outline" className="mr-auto">
                          {control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" ? (
                            <><Percent className="h-3 w-3 ml-1" />درصدی</>
                          ) : (
                            <><DollarSign className="h-3 w-3 ml-1" />ثابت</>
                          )}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <FormLabel className="text-xs text-muted-foreground">حداقل تعداد</FormLabel>
                          <Input
                            type="number"
                            min="1"
                            {...control.register(`meta.discountConditions.${idx}.minQuantity`, { valueAsNumber: true })}
                            placeholder="مثلاً 5"
                          />
                        </div>
                        
                        <div>
                          <FormLabel className="text-xs text-muted-foreground">نوع تخفیف</FormLabel>
                          <Controller
                            name={`meta.discountConditions.${idx}.type`}
                            control={control}
                            defaultValue="percentage"
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">درصدی</SelectItem>
                                  <SelectItem value="fixed">مقدار ثابت</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        
                        <div>
                          <FormLabel className="text-xs text-muted-foreground">
                            مقدار{" "}
                            {control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" ? "(درصد)" : "(تومان)"}
                          </FormLabel>
                          <Input
                            type="number"
                            min="0"
                            max={control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" ? "100" : undefined}
                            {...control.register(`meta.discountConditions.${idx}.value`, { valueAsNumber: true })}
                            placeholder={control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" ? "مثلاً 10" : "مثلاً 50000"}
                          />
                        </div>
                      </div>
                      
                      {/* Preview */}
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-xs text-muted-foreground">پیش‌نمایش:</p>
                        <p className="text-sm">
                          با خرید {control._getWatch(`meta.discountConditions.${idx}.minQuantity`) || 1} عدد یا بیشتر،{" "}
                          {control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" 
                            ? `${control._getWatch(`meta.discountConditions.${idx}.value`) || 0}% تخفیف`
                            : `${(control._getWatch(`meta.discountConditions.${idx}.value`) || 0).toLocaleString()} تومان تخفیف`
                          } دریافت کنید.
                        </p>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={remove}
                        className="absolute top-2 left-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
                addLabel="افزودن شرط تخفیف"
              />
              
              {/* Help text */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  شرایط تخفیف به ترتیب اولویت اعمال می‌شوند. شرط با بیشترین تعداد که مطابقت داشته باشد، اعمال خواهد شد.
                </AlertDescription>
              </Alert>
            </div>
          )} />
        </div>
      </TabsContent>
      <TabsContent value="flags" className="flex-1">
        <div className="space-y-3">
          <FormField control={control} name="meta.isLimited" render={({ field }) => (
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
}

export function ProductInfoTableField({ control }: { control: any }) {
  return (
    <FormField control={control} name="meta.infoTable" render={() => (
      <ArrayFieldDnd
        control={control}
        name="meta.infoTable"
        emptyItem={() => ({ label: "", value: "" })}
        renderItem={(_item, idx, { remove, field, dragHandleProps }) => (
          <div className="flex gap-2 items-center mb-2">
            <span {...dragHandleProps} className="cursor-grab">☰</span>
            <Input {...control.register(`meta.infoTable.${idx}.label`)} placeholder="برچسب" className="flex-1" />
            <Input {...control.register(`meta.infoTable.${idx}.value`)} placeholder="مقدار" className="flex-1" />
            <Button type="button" variant="destructive" size="sm" onClick={remove}>حذف</Button>
          </div>
        )}
        addLabel="افزودن ردیف"
      />
    )} />
  )
}

export function ProductDownloadsField({ control, form }: { control: any, form: any }) {
  return (
    <>
      <FormField control={control} name="isDownloadable" render={({ field }) => (
        <div className="flex items-center gap-2 mb-2">
          <Switch checked={field.value} onCheckedChange={field.onChange} id="isDownloadable-switch" />
          <label htmlFor="isDownloadable-switch" className="text-sm font-medium select-none cursor-pointer">دانلودی است؟</label>
        </div>
      )} />
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

export function ProductAttachmentsField({ form }: { form: any }) {
  return (
    <AttachmentFilesField
      name="meta.attachments"
      addLabel="افزودن فایل رایگان"
      form={form}
    />
  )
}

export function ProductThumbnailField({ form }: { form: any }) {
  return <ThumbnailSelectorField form={form} /> }

export function ProductDiscountsField({ control }: { control: any }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        <p>تخفیفات کمیتی: براساس تعداد خریداری شده، تخفیف اعمال می‌شود.</p>
      </div>
      
      <FormField control={control} name="meta.discountConditions" render={() => (
        <div className="space-y-4">
          <ArrayFieldDnd
            control={control}
            name="meta.discountConditions"
            emptyItem={() => ({ minQuantity: 1, type: "percentage", value: 0 })}
            renderItem={(item, idx, { remove, field, dragHandleProps }) => (
              <Card className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    شرط تخفیف #{idx + 1}
                    <Badge variant="outline" className="mr-auto">
                      {control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" ? (
                        <><Percent className="h-3 w-3 ml-1" />درصدی</>
                      ) : (
                        <><DollarSign className="h-3 w-3 ml-1" />ثابت</>
                      )}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <FormLabel className="text-xs text-muted-foreground">حداقل تعداد</FormLabel>
                      <Input
                        type="number"
                        min="1"
                        {...control.register(`meta.discountConditions.${idx}.minQuantity`, { valueAsNumber: true })}
                        placeholder="مثلاً 5"
                      />
                    </div>
                    
                    <div>
                      <FormLabel className="text-xs text-muted-foreground">نوع تخفیف</FormLabel>
                      <Select
                        value={control._getWatch(`meta.discountConditions.${idx}.type`) || "percentage"}
                        onValueChange={(value) => control.setValue(`meta.discountConditions.${idx}.type`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">درصدی</SelectItem>
                          <SelectItem value="fixed">مقدار ثابت</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FormLabel className="text-xs text-muted-foreground">
                        مقدار{" "}
                        {control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" ? "(درصد)" : "(تومان)"}
                      </FormLabel>
                      <Input
                        type="number"
                        min="0"
                        max={control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" ? "100" : undefined}
                        {...control.register(`meta.discountConditions.${idx}.value`, { valueAsNumber: true })}
                        placeholder={control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" ? "مثلاً 10" : "مثلاً 50000"}
                      />
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">پیش‌نمایش:</p>
                    <p className="text-sm">
                      با خرید {control._getWatch(`meta.discountConditions.${idx}.minQuantity`) || 1} عدد یا بیشتر،{" "}
                      {control._getWatch(`meta.discountConditions.${idx}.type`) === "percentage" 
                        ? `${control._getWatch(`meta.discountConditions.${idx}.value`) || 0}% تخفیف`
                        : `${(control._getWatch(`meta.discountConditions.${idx}.value`) || 0).toLocaleString()} تومان تخفیف`
                      } دریافت کنید.
                    </p>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={remove}
                    className="absolute top-2 left-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )}
            addLabel="افزودن شرط تخفیف"
          />
          
          {/* Help text */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              شرایط تخفیف به ترتیب اولویت اعمال می‌شوند. شرط با بیشترین تعداد که مطابقت داشته باشد، اعمال خواهد شد.
            </AlertDescription>
          </Alert>
        </div>
      )} />
    </div>
  )
}
