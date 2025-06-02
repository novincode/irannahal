'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Badge } from '@shadcn/badge'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { formatPrice } from '@ui/lib/utils'

interface RevenueData {
  date: string
  revenue: number
  orders: number
}

interface RevenueChartProps {
  data: RevenueData[]
  title: string
}

export function RevenueChart({ data, title }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fa-IR', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <div className="text-sm text-muted-foreground">کل فروش</div>
              <div className="font-bold">{formatPrice(totalRevenue)}</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-muted-foreground">کل سفارش</div>
              <div className="font-bold">{totalOrders}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>داده‌ای برای نمایش وجود ندارد</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple bar chart */}
            <div className="flex items-end justify-between gap-2 h-64 bg-gradient-to-t from-muted/50 to-transparent rounded-lg p-4">
              {data.map((item, index) => {
                const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
                return (
                  <div key={index} className="flex flex-col items-center flex-1 max-w-12">
                    <div 
                      className="w-full bg-primary rounded-t-md min-h-[4px] relative group cursor-pointer transition-all duration-200 hover:bg-primary/80"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div className="text-center">
                          <div className="font-medium">{formatPrice(item.revenue)}</div>
                          <div className="text-gray-300">{item.orders} سفارش</div>
                          <div className="text-gray-400">{formatDate(item.date)}</div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      {formatDate(item.date)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>فروش روزانه</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
