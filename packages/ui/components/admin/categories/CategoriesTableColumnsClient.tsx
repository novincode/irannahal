"use client"
import { ColumnDef } from "@tanstack/react-table"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import { Button } from "@ui/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@ui/components/ui/dropdown-menu"
import { Checkbox } from "@ui/components/ui/checkbox"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@ui/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { deleteCategory, deleteCategories } from "@actions/categories/delete"
import { toast } from "sonner"
import NextLink from "next/link"

export function useCategoryColumns(): ColumnDef<CategoryWithDynamicRelations<{ parent: true }>>[] {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!categoryToDelete) return
    
    try {
      const result = await deleteCategory(categoryToDelete)
      if (result.success) {
        toast.success("دسته‌بندی با موفقیت حذف شد")
        setTimeout(() => router.refresh(), 100) // Ensure table updates after dialog closes
      } else {
        toast.error(result.error || "خطا در حذف دسته‌بندی")
      }
    } catch (error) {
      toast.error("خطا در حذف دسته‌بندی")
      console.error("Failed to delete category:", error)
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
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
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center p-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>نام <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => row.getValue("name"),
    },
    {
      accessorKey: "slug",
      header: "اسلاگ",
      cell: ({ row }) => row.getValue("slug"),
    },
    {
      id: "parent",
      header: "والد",
      cell: ({ row }) => row.original.parent?.name || "-",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const category = row.original
        
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Actions</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <NextLink href={`/categories/${category.id}/edit`}>
                    ویرایش
                  </NextLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    setCategoryToDelete(category.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="h-4 w-4 ml-2" /> حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteDialogOpen && categoryToDelete === category.id} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
                  <AlertDialogDescription>
                    آیا از حذف دسته‌بندی "{category.name}" اطمینان دارید؟
                    <br />
                    دسته‌های فرزند این دسته به دسته‌های بدون والد تبدیل می‌شوند.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )
      },
    },
  ]
}

export function CategoriesTableToolbar({ table, onBulkDelete }: { table: any, onBulkDelete?: (ids: string[]) => Promise<void> }) {
  const selectedRows: { original: CategoryWithDynamicRelations<{ parent: true }> }[] = table.getSelectedRowModel().rows
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleBulkDelete = async () => {
    setDeleting(true)
    try {
      const ids = selectedRows.map(row => row.original.id)
      if (onBulkDelete) {
        await onBulkDelete(ids)
      }
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
            <AlertDialogTitle>حذف دسته‌بندی‌ها</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید همه دسته‌بندی‌های انتخاب‌شده را حذف کنید؟ دسته‌های فرزند این دسته‌ها به دسته‌های بدون والد تبدیل می‌شوند. این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
