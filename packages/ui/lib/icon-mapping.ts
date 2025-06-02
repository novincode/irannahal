import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Users, 
  Package, 
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Settings,
  type LucideIcon
} from 'lucide-react'

export const iconMap = {
  ShoppingBag,
  DollarSign,
  Clock,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Settings,
} as const

export type IconName = keyof typeof iconMap

export function getIcon(iconName: IconName): LucideIcon {
  return iconMap[iconName]
}
