"use client"
import { ColumnDef } from "@tanstack/react-table"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import { Button } from "@ui/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@ui/components/ui/dropdown-menu"
import { Checkbox } from "@ui/components/ui/checkbox"

export function useCategoryColumns(): ColumnDef<CategoryWithDynamicRelations<{ parent: true }>>[] {
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
                <a href={`/categories/${category.id}/edit`}>ویرایش</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Add more actions here if needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
