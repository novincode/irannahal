'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Badge } from '@shadcn/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatPrice } from '@ui/lib/utils'
import { getIcon, type IconName } from '@ui/lib/icon-mapping'

interface StatsCardProps {
  title: string
  value: string | number
  icon: IconName
  growth?: number
  isRevenue?: boolean
  description?: string
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  growth, 
  isRevenue = false, 
  description 
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (isRevenue && typeof val === 'number') {
      return formatPrice(val)
    }
    return typeof val === 'number' ? val.toLocaleString('fa-IR') : val
  }

  const getGrowthIcon = () => {
    if (growth === undefined || growth === 0) return Minus
    return growth > 0 ? TrendingUp : TrendingDown
  }

  const getGrowthColor = () => {
    if (growth === undefined || growth === 0) return 'text-muted-foreground'
    return growth > 0 ? 'text-green-600' : 'text-red-600'
  }

  const GrowthIcon = getGrowthIcon()
  const Icon = getIcon(icon)

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(value)}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          
          {growth !== undefined && (
            <Badge 
              variant="outline" 
              className={`${getGrowthColor()} border-current bg-transparent`}
            >
              <GrowthIcon className="h-3 w-3 ml-1" />
              {Math.abs(growth).toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
