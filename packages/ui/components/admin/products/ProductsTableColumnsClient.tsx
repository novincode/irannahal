"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ProductSchema as Product } from "@db/types"
import { Button } from "@ui/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@ui/components/ui/dropdown-menu"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Badge } from "@ui/components/ui/badge"

export function useProductColumns(): ColumnDef<Product>[] {
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
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => <Badge variant={'outline'}>{row.getValue("status")}</Badge>,
    },
    {
      accessorKey: "price",
      header: () => <div className="">قیمت</div>,
      cell: ({ row }) => {
        const price = row.getValue("price") as any
        return <div className=" font-medium">{price}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>عملیات‌ها</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>
                کپی ID محصول
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = `/products/${product.id}/edit`}>
                ویرایش
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
