'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { MapPin, Plus } from 'lucide-react'
import { AddressForm } from '@ui/components/panel/AddressForm'
import { AddressCard } from '@ui/components/panel/AddressCard'
import type { Address } from '@actions/addresses/types'
import { getAddresses } from '@actions/addresses/get'

interface AddressesPageClientProps {
  initialAddresses: Address[]
}

export default function AddressesPageClient({ initialAddresses }: AddressesPageClientProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)

  const handleUpdate = async () => {
    try {
      const updatedAddresses = await getAddresses()
      setAddresses(updatedAddresses)
    } catch (error) {
      console.error('Error refreshing addresses:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">آدرس‌ها</h1>
          <p className="text-muted-foreground mt-2">
            آدرس‌های خود را مدیریت کنید
          </p>
        </div>
        <AddressForm onSuccess={handleUpdate} />
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted/30 p-6 mb-4">
              <MapPin className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium text-lg mb-2">هنوز آدرسی اضافه نکرده‌اید</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              برای سهولت در فرآیند خرید، آدرس‌های خود را اضافه کنید
            </p>
            <AddressForm 
              onSuccess={handleUpdate}
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  افزودن اولین آدرس
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
