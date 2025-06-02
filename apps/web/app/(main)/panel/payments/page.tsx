import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@packages/auth'
import { getUserPayments, type PaymentWithOrder } from '@packages/actions/payments'
import { Button } from '@shadcn/button'
import { Badge } from '@shadcn/badge'
import { 
  CreditCard, 
  Package, 
  Calendar,
  ChevronRight,
  Receipt
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { formatPrice } from '@ui/lib/utils'

function getStatusBadge(status: string) {
  const variants = {
    pending: { variant: 'secondary' as const, label: 'در انتظار' },
    completed: { variant: 'default' as const, label: 'پرداخت شده' },
    failed: { variant: 'destructive' as const, label: 'ناموفق' },
  }
  
  const config = variants[status as keyof typeof variants] || variants.pending
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function getOrderStatusBadge(status: string) {
  const variants = {
    pending: { variant: 'secondary' as const, label: 'در انتظار' },
    paid: { variant: 'default' as const, label: 'پرداخت شده' },
    shipped: { variant: 'default' as const, label: 'ارسال شده' },
    cancelled: { variant: 'destructive' as const, label: 'لغو شده' },
  }
  
  const config = variants[status as keyof typeof variants] || variants.pending
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function PaymentCard({ payment }: { payment: PaymentWithOrder }) {
  return (
    <div className="border rounded-lg p-6 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">پرداخت #{payment.id.slice(-8)}</h3>
            <p className="text-sm text-muted-foreground">
              {payment.method} • {payment.createdAt && formatDistanceToNow(payment.createdAt, { 
                addSuffix: true, 
                locale: faIR 
              })}
            </p>
          </div>
        </div>
        {getStatusBadge(payment.status)}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">مبلغ پرداخت</span>
          <span className="font-medium">{formatPrice(payment.amount)}</span>
        </div>

        {payment.order && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">شماره سفارش</span>
              <span className="font-mono text-sm">#{payment.order.id.slice(-8)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">وضعیت سفارش</span>
              {getOrderStatusBadge(payment.order.status)}
            </div>

            {payment.order.items && payment.order.items.length > 0 && (
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">محصولات ({payment.order.items.length})</span>
                </div>
                <div className="space-y-2">
                  {payment.order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product?.name || 'محصول حذف شده'} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {payment.order.items.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      و {payment.order.items.length - 2} محصول دیگر...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t">
              <Link href={`/panel/orders/${payment.order.id}`}>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Receipt className="w-4 h-4" />
                  مشاهده جزئیات سفارش
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default async function PaymentsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth')
  }

  const payments = await getUserPayments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">پرداخت‌ها</h1>
          <p className="text-muted-foreground">
            مشاهده تاریخچه پرداخت‌های شما
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">هیچ پرداختی یافت نشد</h3>
          <p className="text-muted-foreground mb-6">
            شما هنوز هیچ پرداختی انجام نداده‌اید
          </p>
          <Link href="/products">
            <Button>مشاهده محصولات</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  )
}