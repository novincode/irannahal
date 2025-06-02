'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@ui/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@ui/components/ui/radio-group'
import { Label } from '@ui/components/ui/label'
import { Card, CardContent } from '@ui/components/ui/card'
import { MdLocationOn, MdAdd, MdCheck } from 'react-icons/md'
import { useCheckout } from '../CheckoutContext'
import { AddressForm } from '@ui/components/panel/AddressForm'
import { getAddresses } from '@actions/addresses/get'
import type { AddressSchema } from '@db/types'

export function AddressStep() {
  const { state, setSelectedAddress, setAddresses, proceedToNext, setStep } = useCheckout()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedAddress, setLocalSelectedAddress] = useState<string>(state.selectedAddressId || '')

  // Use cached addresses if available, otherwise load them
  const addresses = state.addresses || []
  const shouldLoadAddresses = !state.addressesLoaded

  useEffect(() => {
    if (shouldLoadAddresses) {
      loadAddresses()
    }
  }, [shouldLoadAddresses])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const userAddresses = await getAddresses()
      setAddresses(userAddresses)
    } catch (error) {
      console.error('Failed to load addresses:', error)
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddressCreate = () => {
    // Reload addresses after creation to update cache
    loadAddresses()
    setIsDialogOpen(false)
  }

  const handleAddressSelect = (addressId: string) => {
    setLocalSelectedAddress(addressId)
    setSelectedAddress(addressId)
  }

  const handleProceed = () => {
    if (selectedAddress) {
      proceedToNext()
    }
  }

  const handleBack = () => {
    setStep('auth')
  }

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="text-center">در حال بارگذاری آدرس‌ها...</div>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MdLocationOn className="w-5 h-5" />
          انتخاب آدرس ارسال
        </h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MdAdd className="w-4 h-4" />
              افزودن آدرس
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>افزودن آدرس جدید</DialogTitle>
            </DialogHeader>
            
            <AddressForm 
              onSuccess={handleAddressCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <MdLocationOn className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-medium mb-2">هنوز آدرسی ثبت نشده</h4>
            <p className="text-muted-foreground text-sm">
              لطفاً برای ادامه فرآیند خرید، آدرس خود را ثبت کنید
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <MdAdd className="w-4 h-4" />
                افزودن آدرس
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>افزودن آدرس جدید</DialogTitle>
              </DialogHeader>
              
              <AddressForm 
                onSuccess={handleAddressCreate}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-4">
          <RadioGroup value={selectedAddress} onValueChange={handleAddressSelect}>
            {addresses.map((address) => (
              <div key={address.id} className="relative">
                <Label
                  htmlFor={address.id}
                  className="cursor-pointer"
                >
                  <Card className={`transition-colors ${selectedAddress === address.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{address.title}</span>
                            {address.isDefault && (
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                پیش‌فرض
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.province} - {address.city} - {address.address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            کد پستی: {address.postalCode}
                          </p>
                        </div>
                        
                        {selectedAddress === address.id && (
                          <MdCheck className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              بازگشت
            </Button>
            
            {selectedAddress && (
              <Button onClick={handleProceed} className="gap-2">
                ادامه
                <MdCheck className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
