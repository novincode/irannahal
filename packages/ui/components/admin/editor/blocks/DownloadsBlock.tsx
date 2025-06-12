"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Textarea } from "@ui/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card"
import { Plus, Trash2, Download, ExternalLink, File, Link2 } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui/components/ui/select"
import { Switch } from "@ui/components/ui/switch"
import { cn } from "@ui/lib/utils"
import type { BlockProps } from "@data/usePostEditorStore"

interface DownloadsBlockProps extends BlockProps {}

interface DownloadItem {
  id: string
  name: string
  url: string
  description?: string
  size?: string
  format?: string
  type: 'file' | 'link'
  maxDownloads: number
}

export function DownloadsBlock({ control, postType, blockId, onUpdate }: DownloadsBlockProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="downloads"
        render={({ field }) => {
          const downloads: DownloadItem[] = field.value || []
          
          const addDownload = () => {
            const newDownload: DownloadItem = {
              id: Date.now().toString(),
              name: '',
              url: '',
              description: '',
              type: 'file',
              maxDownloads: 0
            }
            const updatedDownloads = [...downloads, newDownload]
            field.onChange(updatedDownloads)
            onUpdate?.('downloads', updatedDownloads)
          }
          
          const removeDownload = (id: string) => {
            const updatedDownloads = downloads.filter(download => download.id !== id)
            field.onChange(updatedDownloads)
            onUpdate?.('downloads', updatedDownloads)
          }
          
          const updateDownload = (id: string, key: keyof DownloadItem, value: string | number) => {
            const updatedDownloads = downloads.map(download => 
              download.id === id ? { ...download, [key]: value } : download
            )
            field.onChange(updatedDownloads)
            onUpdate?.('downloads', updatedDownloads)
          }

          return (
            <FormItem>
              <FormLabel>
                {postType === 'product' ? 'دانلودهای پس از خرید' : 'فایل‌های قابل دانلود'}
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {downloads.map((download) => (
                    <Card key={download.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            {download.name || 'فایل جدید'}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDownload(download.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm font-medium">نام فایل</label>
                            <Input
                              placeholder="مثال: راهنمای نصب"
                              value={download.name}
                              onChange={(e) => updateDownload(download.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">نوع</label>
                            <Select
                              value={download.type}
                              onValueChange={(value: 'file' | 'link') => updateDownload(download.id, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="انتخاب نوع" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="file">
                                  <div className="flex items-center gap-2">
                                    <File className="w-4 h-4" />
                                    فایل
                                  </div>
                                </SelectItem>
                                <SelectItem value="link">
                                  <div className="flex items-center gap-2">
                                    <Link2 className="w-4 h-4" />
                                    لینک
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">لینک دانلود</label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="https://example.com/file.pdf"
                                value={download.url}
                                onChange={(e) => updateDownload(download.id, 'url', e.target.value)}
                              />
                              {download.url && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(download.url, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm font-medium">حجم فایل</label>
                            <Input
                              placeholder="مثال: 2.5 MB"
                              value={download.size || ''}
                              onChange={(e) => updateDownload(download.id, 'size', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">فرمت</label>
                            <Input
                              placeholder="مثال: PDF"
                              value={download.format || ''}
                              onChange={(e) => updateDownload(download.id, 'format', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">حداکثر دانلود</label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0 = نامحدود"
                              value={download.maxDownloads || ''}
                              onChange={(e) => updateDownload(download.id, 'maxDownloads', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">توضیحات</label>
                          <Textarea
                            placeholder="توضیحات کوتاه درباره فایل..."
                            value={download.description || ''}
                            onChange={(e) => updateDownload(download.id, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDownload}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    افزودن فایل دانلود
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </div>
  )
}
