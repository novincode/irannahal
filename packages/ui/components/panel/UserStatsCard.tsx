'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Badge } from '@shadcn/badge'
import { iconMap, type IconName } from '@ui/lib/icon-mapping'
import { cn, formatPrice } from '@ui/lib/utils'

interface UserStatsCardProps {
  title: string
  value: string | number
  icon: IconName
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  isRevenue?: boolean
  className?: string
}

export function UserStatsCard({
  title,
  value,
  icon,
  description,
  trend,
  isRevenue = false,
  className
}: UserStatsCardProps) {
  const Icon = iconMap[icon]
  const displayValue = isRevenue && typeof value === 'number' ? formatPrice(value) : value

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        
        <div className="flex items-center justify-between mt-2">
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {trend && (
            <Badge 
              variant={trend.isPositive ? "default" : "secondary"}
              className="text-xs"
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
