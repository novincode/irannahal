
import type { AddressSchema } from '@db/types'

export type CheckoutStep = 'auth' | 'address' | 'shipping' | 'review' | 'payment'

export type ShippingMethod = {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
}

export type CheckoutState = {
  currentStep: CheckoutStep
  isAuthenticated: boolean
  selectedAddressId?: string
  selectedShippingMethod?: ShippingMethod
  orderId?: string
  addresses?: AddressSchema[]
  addressesLoaded?: boolean
}

export type CheckoutContextType = {
  state: CheckoutState
  setStep: (step: CheckoutStep) => void
  setAuthenticated: (isAuth: boolean) => void
  setSelectedAddress: (addressId: string) => void
  setSelectedShipping: (method: ShippingMethod) => void
  setOrderId: (orderId: string) => void
  setAddresses: (addresses: AddressSchema[]) => void
  canProceedToStep: (step: CheckoutStep) => boolean
  proceedToNext: () => void
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'post',
    name: 'پست',
    description: 'ارسال عادی با پست ایران',
    price: 15000,
    estimatedDays: 3
  },
  {
    id: 'barbari',
    name: 'باربری',
    description: 'ارسال سریع با باربری',
    price: 25000,
    estimatedDays: 1
  },
  {
    id: 'tipax',
    name: 'تیپاکس',
    description: 'ارسال اکسپرس',
    price: 35000,
    estimatedDays: 1
  }
]
