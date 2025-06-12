"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Textarea } from "@ui/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ui/components/ui/tabs"
import { FileText, Eye, Code } from "lucide-react"
import type { BlockProps } from "@data/usePostEditorStore"

interface ContentBlockProps extends BlockProps {
  enableMarkdown?: boolean
  enableWysiwyg?: boolean
}

export function ContentBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  enableMarkdown = true,
  enableWysiwyg = false 
}: ContentBlockProps) {
  const [activeTab, setActiveTab] = React.useState('write')
  
  const getContentLabel = () => {
    switch (postType) {
      case 'product':
        return 'توضیحات کامل محصول'
      case 'post':
        return 'محتوای پست'
      case 'page':
        return 'محتوای صفحه'
      default:
        return 'محتوا'
    }
  }
  
  const getContentPlaceholder = () => {
    switch (postType) {
      case 'product':
        return 'توضیحات کاملی از محصول، ویژگی‌ها، کاربرد و نحوه استفاده را بنویسید...'
      case 'post':
        return 'محتوای کامل پست خود را اینجا بنویسید...'
      case 'page':
        return 'محتوای صفحه را اینجا وارد کنید...'
      default:
        return 'محتوا را اینجا وارد کنید...'
    }
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{getContentLabel()}</FormLabel>
            <FormControl>
              {enableMarkdown ? (
                <Card>
                  <CardHeader className="pb-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="write" className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          نوشتن
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          پیش‌نمایش
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardHeader>
                  <CardContent>
                    <div className={activeTab === 'write' ? 'block' : 'hidden'}>
                      <Textarea
                        {...field}
                        placeholder={getContentPlaceholder()}
                        rows={12}
                        className="font-mono text-sm resize-none"
                        onChange={(e) => {
                          field.onChange(e)
                          onUpdate?.('content', e.target.value)
                        }}
                      />
                      <div className="mt-2 text-xs text-muted-foreground">
                        پشتیبانی از Markdown: **پررنگ**, *کج*, `کد`, [لینک](url), و غیره
                      </div>
                    </div>
                    <div className={activeTab === 'preview' ? 'block' : 'hidden'}>
                      <div className="min-h-[300px] p-4 border rounded-md bg-muted/30">
                        {field.value ? (
                          <MarkdownPreview content={field.value} />
                        ) : (
                          <div className="text-muted-foreground text-center py-12">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            محتوای برای پیش‌نمایش وجود ندارد
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Textarea
                  {...field}
                  placeholder={getContentPlaceholder()}
                  rows={12}
                  onChange={(e) => {
                    field.onChange(e)
                    onUpdate?.('content', e.target.value)
                  }}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// Simple markdown preview component
function MarkdownPreview({ content }: { content: string }) {
  // Basic markdown parsing - in a real app, use a proper markdown parser like react-markdown
  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
  }
  
  const htmlContent = parseMarkdown(content)
  
  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ 
        __html: `<p>${htmlContent}</p>` 
      }} 
    />
  )
}
