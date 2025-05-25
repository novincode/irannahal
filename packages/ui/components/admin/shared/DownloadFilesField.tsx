import * as React from "react"
import { Input } from "@ui/components/ui/input"
import { Button } from "@ui/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui/components/ui/select"
import { Switch } from "@ui/components/ui/switch"
import { ArrayFieldDnd } from "./ArrayFieldDnd"
import { FormField } from "@ui/components/ui/form"
import { useWatch } from "react-hook-form"

interface DownloadFilesFieldProps {
  name: string
  form: any
  showLimitSwitch?: boolean
  addLabel?: string
  label?: string // now optional
}

export function DownloadFilesField({ name, form, showLimitSwitch = false, addLabel = "افزودن آیتم", label }: DownloadFilesFieldProps) {
  // This is now only for paid downloads (with type, limit, etc.)
  return (
    <div className="space-y-2">
      {label && <div className="font-bold mb-2">{label}</div>}
      <FormField
        control={form.control}
        name={name}
        render={() => (
          <ArrayFieldDnd
            control={form.control}
            name={name}
            emptyItem={() => ({ type: "file", label: "", url: "", hasLimit: false, maxDownloads: 0 })}
            renderItem={(item, idx, { remove, dragHandleProps }) => {
              const watchedType = useWatch({ control: form.control, name: `${name}.${idx}.type` }) ?? "file"
              const watchedItem = useWatch({ control: form.control, name: `${name}.${idx}` }) || item
              const [limitEnabled, setLimitEnabled] = React.useState(
                typeof watchedItem.maxDownloads === 'number' && watchedItem.maxDownloads > 0
              )
              React.useEffect(() => {
                if (typeof watchedItem.maxDownloads === 'number' && watchedItem.maxDownloads > 0) {
                  setLimitEnabled(true)
                }
              }, [watchedItem.maxDownloads])
              const handleSwitchChange = (v: boolean) => {
                setLimitEnabled(v)
                if (!v) {
                  form.setValue(`${name}.${idx}.maxDownloads`, undefined)
                }
              }
              return (
                <div className="flex flex-col gap-2 mb-4 border rounded-lg p-3 bg-muted/30">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span {...dragHandleProps} className="cursor-grab">☰</span>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs font-medium">عنوان فایل</label>
                      <Input {...form.register(`${name}.${idx}.label`)} placeholder="مثلاً راهنمای نصب" className="w-full" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs font-medium">آدرس فایل</label>
                      <Input {...form.register(`${name}.${idx}.url`)} placeholder="https://..." className="w-full" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="text-xs font-medium">نوع</label>
                      <Select
                        value={watchedType}
                        onValueChange={v => {
                          form.setValue(`${name}.${idx}.type`, v, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="انتخاب نوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="file">فایل</SelectItem>
                          <SelectItem value="link">لینک</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" variant="destructive" size="sm" onClick={remove} className="self-end">حذف</Button>
                  </div>
                  {showLimitSwitch && (
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs">محدودیت دانلود؟</label>
                        <Switch
                          checked={limitEnabled}
                          onCheckedChange={handleSwitchChange}
                          id={`${name}-${idx}-hasLimit`}
                        />
                      </div>
                      {limitEnabled && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs">حداکثر دانلود</label>
                          <Input
                            type="number"
                            min={0}
                            {...form.register(`${name}.${idx}.maxDownloads`, { valueAsNumber: true, min: 0 })}
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            }}
            addLabel={addLabel}
          />
        )}
      />
    </div>
  )
}

// New: For free attachments (no type, no limit)
export function AttachmentFilesField({ name, form, addLabel = "افزودن فایل رایگان", label }: { name: string, form: any, addLabel?: string, label?: string }) {
  return (
    <div className="space-y-2">
      {label && <div className="font-bold mb-2">{label}</div>}
      <FormField
        control={form.control}
        name={name}
        render={() => (
          <ArrayFieldDnd
            control={form.control}
            name={name}
            emptyItem={() => ({ label: "", url: "" })}
            renderItem={(_item, idx, { remove, dragHandleProps }) => (
              <div className="flex items-center gap-2 mb-4 border rounded-lg p-3 bg-muted/30">
                <span {...dragHandleProps} className="cursor-grab">☰</span>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs font-medium">عنوان فایل</label>
                  <Input {...form.register(`${name}.${idx}.label`)} placeholder="مثلاً راهنمای نصب" className="w-full" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs font-medium">آدرس فایل</label>
                  <Input {...form.register(`${name}.${idx}.url`)} placeholder="https://..." className="w-full" />
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={remove} className="self-end">حذف</Button>
              </div>
            )}
            addLabel={addLabel}
          />
        )}
      />
    </div>
  )
}
