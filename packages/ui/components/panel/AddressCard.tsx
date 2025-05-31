'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Badge } from '@shadcn/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shadcn/alert-dialog'
import { 
  MapPin, 
  Phone, 
  Edit3, 
  Trash2, 
  Star,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import { deleteAddress } from '@actions/addresses/delete'
import { AddressForm } from './AddressForm'
import type { Address } from '@actions/addresses/types'

interface AddressCardProps {
  address: Address
  onUpdate?: () => void
}

export function AddressCard({ address, onUpdate }: AddressCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAddress(address.id)
      toast.success('آدرس با موفقیت حذف شد')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطا در حذف آدرس')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="relative">
      {address.isDefault && (
        <div className="absolute top-3 left-3">
          <Badge variant="default" className="gap-1">
            <Star className="h-3 w-3" />
            پیش‌فرض
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3 px-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{address.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <User className="h-4 w-4" />
              {address.fullName}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Phone */}
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{address.phone}</span>
        </div>
        
        {/* Address */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <div>
              {address.province} - {address.city}
              {address.district && ` - ${address.district}`}
            </div>
            <div className="text-muted-foreground">
              {address.address}
            </div>
            <div className="text-xs text-muted-foreground">
              کد پستی: {address.postalCode}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <AddressForm 
            address={address}
            onSuccess={onUpdate}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" />
                ویرایش
              </Button>
            }
          />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>حذف آدرس</AlertDialogTitle>
                <AlertDialogDescription>
                  آیا از حذف آدرس "{address.title}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>انصراف</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? 'در حال حذف...' : 'حذف آدرس'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
