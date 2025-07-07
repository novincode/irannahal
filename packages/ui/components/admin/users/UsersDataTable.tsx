'use client'

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { UserRole } from "@db/schema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shadcn/table"
import { Button } from "@shadcn/button"
import { Input } from "@shadcn/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shadcn/dropdown-menu"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { UserRoleFilter } from "./UserRoleFilter"
import { Avatar, AvatarFallback, AvatarImage } from "@shadcn/avatar"

interface User {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  image: string | null
  role: UserRole
  deletedAt: Date | null
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "نام",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name || "بدون نام"}</div>
            <div className="text-sm text-muted-foreground">
              {user.email || user.phone}
            </div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "role",
    header: "نقش",
    cell: ({ row }) => {
      const roleLabels: Record<UserRole, string> = {
        admin: "مدیر",
        user: "کاربر",
        author: "نویسنده",
        customer: "مشتری",
      }
      return roleLabels[row.original.role] || row.original.role
    }
  },
  {
    accessorKey: "status",
    header: "وضعیت",
    cell: ({ row }) => {
      return row.original.deletedAt ? "حذف شده" : "فعال"
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter()
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">منو</span>
              <span className="h-4 w-4">⋮</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => router.push(`/panel/users/${row.original.id}/edit`)}
            >
              ویرایش
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface DataTableProps {
  data: User[]
  pageCount: number
  initialSearch?: string
  initialRole?: string
  initialStatus?: string
}

export function UsersDataTable({ 
  data,
  pageCount,
  initialSearch = "",
  initialRole,
  initialStatus,
}: DataTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    ...(initialRole ? [{ id: "role", value: initialRole }] : []),
    ...(initialStatus ? [{ id: "status", value: initialStatus }] : []),
  ])
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20,
  })
  const [globalFilter, setGlobalFilter] = React.useState(initialSearch)

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      columnFilters,
      pagination,
      globalFilter,
    },
  })

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (globalFilter) {
      params.set("search", globalFilter)
    } else {
      params.delete("search")
    }
    if (columnFilters.find(f => f.id === "role")?.value) {
      params.set("role", columnFilters.find(f => f.id === "role")?.value as string)
    } else {
      params.delete("role")
    }
    if (columnFilters.find(f => f.id === "status")?.value) {
      params.set("status", columnFilters.find(f => f.id === "status")?.value as string)
    } else {
      params.delete("status")
    }
    params.set("page", String(pageIndex + 1))
    params.set("pageSize", String(pageSize))
    router.push(`${pathname}?${params.toString()}`)
  }, [globalFilter, columnFilters, pageIndex, pageSize, router, pathname, searchParams])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="جستجو..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <UserRoleFilter
          value={columnFilters.find(f => f.id === "role")?.value as string}
          onChange={(value) => {
            setColumnFilters(prev => {
              const filtered = prev.filter(f => f.id !== "role")
              if (value) {
                return [...filtered, { id: "role", value }]
              }
              return filtered
            })
          }}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  نتیجه‌ای یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 space-x-reverse">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          بعدی
        </Button>
      </div>
    </div>
  )
}
