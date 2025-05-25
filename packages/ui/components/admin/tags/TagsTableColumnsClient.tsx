"use client"
import { ColumnDef } from "@tanstack/react-table"
import type { TagWithDynamicRelations } from "@actions/tags/types"
import { Button } from "@ui/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@ui/components/ui/dropdown-menu"
import { Checkbox } from "@ui/components/ui/checkbox"
import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@ui/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { deleteTag, deleteTags } from "@actions/tags/delete"
import { toast } from "sonner"
import NextLink from "next/link"

export function useTagColumns(): ColumnDef<TagWithDynamicRelations<{}>>[] {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!tagToDelete) return
    try {
      await deleteTag(tagToDelete)
      toast.success("برچسب با موفقیت حذف شد")
      setTimeout(() => router.refresh(), 100)
    } catch (error) {
      toast.error("خطا در حذف برچسب")
    } finally {
      setDeleteDialogOpen(false)
      setTagToDelete(null)
    }
  }

  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center p-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center p-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          نام برچسب
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "slug",
      header: "اسلاگ",
      cell: ({ row }) => row.original.slug,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">باز کردن منو</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>عملیات</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <NextLink href={`/tags/${row.original.id}/edit`}>
                  ویرایش
                </NextLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setTagToDelete(row.original.id)
                  setDeleteDialogOpen(true)
                }}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>حذف برچسب</AlertDialogTitle>
                <AlertDialogDescription>
                  آیا مطمئن هستید که می‌خواهید این برچسب را حذف کنید؟ این عملیات قابل بازگشت نیست.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>انصراف</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]
}

export function TagsTableToolbar({ table }: { table: any }) {
  const selectedRows: { original: TagWithDynamicRelations<{}> }[] = table.getSelectedRowModel().rows
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleBulkDelete = async () => {
    setDeleting(true)
    try {
      const ids = selectedRows.map((row) => row.original.id)
      await deleteTags(ids)
      router.refresh()
      setBulkDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  if (!selectedRows.length) return null
  return (
    <div className="mb-4 flex items-center gap-2">
      <Button variant="destructive" onClick={() => setBulkDeleteOpen(true)} disabled={deleting}>
        حذف انتخاب‌شده‌ها
      </Button>
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف برچسب‌ها</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید همه برچسب‌های انتخاب‌شده را حذف کنید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
