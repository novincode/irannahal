'use client'
import { useEffect, useState } from 'react'
import { getOrders } from "@actions/orders/get"
import { Card } from "@shadcn/card"
import { Button } from "@shadcn/button"
import { formatPrice } from "@ui/lib/utils"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@shadcn/table"
import { Badge } from "@shadcn/badge"
import { orderStatusEnum } from "@db/schema"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
  }
}

interface Order {
  id: string
  createdAt: Date | null
  status: typeof orderStatusEnum.enumValues[number]
  total: number
  items: OrderItem[]
}

interface UserOrdersProps {
  userId: string
}

const statusLabels: Record<string, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
}

const statusColors: Record<string, string> = {
  pending: "warning",
  paid: "success",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
}

export function UserOrders({ userId }: UserOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders({ userId }, { items: { product: true } })
        setOrders(data as unknown as Order[])
      } catch (error) {
        console.error('Error fetching user orders:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [userId])

  if (isLoading) {
    return <div>در حال بارگذاری...</div>
  }

  if (!orders.length) {
    return <div>سفارشی یافت نشد</div>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>شماره سفارش</TableHead>
            <TableHead>تاریخ</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>محصولات</TableHead>
            <TableHead className="text-left">مبلغ کل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>
                {order.createdAt?.toLocaleDateString('fa-IR')}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[order.status] as any}>
                  {statusLabels[order.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  {order.items?.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.product?.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </TableCell>
              <TableCell className="text-left">
                {formatPrice(order.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}