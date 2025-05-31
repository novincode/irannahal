
'use client'

import React, { createContext, useContext, useState } from 'react'
import type { CheckoutContextType, CheckoutState, CheckoutStep, ShippingMethod } from './types'

const CheckoutContext = createContext<CheckoutContextType | null>(null)

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider')
  }
  return context
}

type CheckoutProviderProps = {
  children: React.ReactNode
  initialAuthenticated?: boolean
}

export function CheckoutProvider({ children, initialAuthenticated = false }: CheckoutProviderProps) {
  const [state, setState] = useState<CheckoutState>({
    currentStep: initialAuthenticated ? 'address' : 'auth',
    isAuthenticated: initialAuthenticated,
  })

  const setStep = (step: CheckoutStep) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }

  const setAuthenticated = (isAuth: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isAuthenticated: isAuth,
      currentStep: isAuth ? 'address' : 'auth'
    }))
  }

  const setSelectedAddress = (addressId: string) => {
    setState(prev => ({ ...prev, selectedAddressId: addressId }))
  }

  const setSelectedShipping = (method: ShippingMethod) => {
    setState(prev => ({ ...prev, selectedShippingMethod: method }))
  }

  const setOrderId = (orderId: string) => {
    setState(prev => ({ ...prev, orderId }))
  }

  const canProceedToStep = (step: CheckoutStep): boolean => {
    switch (step) {
      case 'auth':
        return true
      case 'address':
        return state.isAuthenticated
      case 'shipping':
        return state.isAuthenticated && !!state.selectedAddressId
      case 'review':
        return state.isAuthenticated && !!state.selectedAddressId && !!state.selectedShippingMethod
      case 'payment':
        return state.isAuthenticated && !!state.selectedAddressId && !!state.selectedShippingMethod && !!state.orderId
      default:
        return false
    }
  }

  const proceedToNext = () => {
    const steps: CheckoutStep[] = ['auth', 'address', 'shipping', 'review', 'payment']
    const currentIndex = steps.indexOf(state.currentStep)
    const nextStep = steps[currentIndex + 1]
    
    if (nextStep && canProceedToStep(nextStep)) {
      setStep(nextStep)
    }
  }

  const value: CheckoutContextType = {
    state,
    setStep,
    setAuthenticated,
    setSelectedAddress,
    setSelectedShipping,
    setOrderId,
    canProceedToStep,
    proceedToNext,
  }

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  )
}
