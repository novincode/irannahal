'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Badge } from '@shadcn/badge'
import { Crown, Package, TrendingUp } from 'lucide-react'
import { formatPrice } from '@ui/lib/utils'

interface TopProduct {
  id: string
  name: string
  totalSold: number
  revenue: number
}

interface TopProductsProps {
  products: TopProduct[]
  title?: string
}

export function TopProducts({ products, title = "محصولات پرفروش" }: TopProductsProps) {
  const maxSold = Math.max(...products.map(p => p.totalSold))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>هیچ محصولی فروخته نشده</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => {
              const percentage = maxSold > 0 ? (product.totalSold / maxSold) * 100 : 0
              const isTop3 = index < 3

              return (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isTop3 && (
                          <Badge 
                            variant="outline" 
                            className={`
                              text-xs px-1 py-0 min-w-[24px] justify-center
                              ${index === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                index === 1 ? 'bg-gray-100 text-gray-800 border-gray-300' :
                                'bg-orange-100 text-orange-800 border-orange-300'}
                            `}
                          >
                            {index + 1}
                          </Badge>
                        )}
                        {!isTop3 && (
                          <div className="w-6 h-5 flex items-center justify-center text-xs text-muted-foreground">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm truncate max-w-48">
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {product.totalSold} عدد فروخته شده
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <div className="font-bold text-sm">
                        {formatPrice(product.revenue)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-primary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
