import * as React from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@ui/components/ui/drawer"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { mediaFormSchema, MediaFormInput } from "@actions/media/formSchema"
import { updateMedia } from "@actions/media/update"
import { deleteMedia } from "@actions/media/delete"
import type { MediaSchema } from "@db/types"

// Helper to get form-compatible values (alt as string, no id/postId/productId)
function getFormValues(m: MediaSchema | null | undefined): MediaFormInput {
    return {
        url: m?.url || "",
        type: m?.type || "image",
        alt: m?.alt ?? "",
    }
}

interface MediaEditDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    media: MediaSchema | null
    onUpdated: (media: MediaSchema) => void
    onDeleted: (id: string) => void
}

export function MediaEditDrawer({ open, onOpenChange, media, onUpdated, onDeleted }: MediaEditDrawerProps) {
    const form = useForm<MediaFormInput>({
        resolver: zodResolver(mediaFormSchema),
        defaultValues: getFormValues(media),
        values: getFormValues(media),
    })

    React.useEffect(() => {
        form.reset(getFormValues(media))
    }, [media])

    const [loading, setLoading] = React.useState(false)

    const handleSubmit = form.handleSubmit(async (values) => {
        if (!media) return
        setLoading(true)
        try {
            const updated = await updateMedia({ ...values, id: media.id })
            onUpdated(updated)
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    })

    const handleDelete = async () => {
        if (!media) return
        setLoading(true)
        try {
            await deleteMedia(media.id)
            onDeleted(media.id)
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent >
                <div className="container max-w-lg">
                    <DrawerHeader>
                        <DrawerTitle>ویرایش رسانه</DrawerTitle>
                    </DrawerHeader>
                    <Form {...form}>
                        <form onSubmit={handleSubmit} className="space-y-4 p-4">
                            <FormField
                                control={form.control}
                                name="alt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alt (توضیح تصویر)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL</FormLabel>
                                        <FormControl><Input {...field} disabled /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>نوع</FormLabel>
                                        <FormControl><Input {...field} disabled /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DrawerFooter className="flex flex-row gap-2 justify-end">
                                <Button type="submit" disabled={loading}>ذخیره</Button>
                                <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>حذف</Button>
                                <DrawerClose asChild>
                                    <Button type="button" variant="outline">بستن</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </Form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
