'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressFormSchema, type AddressFormInput } from '@actions/addresses/formSchema'
import { Button } from '@shadcn/button'
import { Input } from '@shadcn/input'
import { Textarea } from '@shadcn/textarea'
import { Checkbox } from '@shadcn/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shadcn/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shadcn/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createAddress } from '@actions/addresses/create'
import { updateAddress } from '@actions/addresses/update'
import type { Address } from '@actions/addresses/types'

interface AddressFormProps {
  address?: Address
  onSuccess?: () => void
  trigger?: React.ReactNode
}

// Mock provinces and cities data - replace with real data
const provinces = [
  { value: 'tehran', label: 'تهران' },
  { value: 'isfahan', label: 'اصفهان' },
  { value: 'shiraz', label: 'شیراز' },
  { value: 'mashhad', label: 'مشهد' },
  { value: 'tabriz', label: 'تبریز' },
]

const cities = {
  tehran: [
    { value: 'tehran', label: 'تهران' },
    { value: 'karaj', label: 'کرج' },
    { value: 'varamin', label: 'ورامین' },
  ],
  isfahan: [
    { value: 'isfahan', label: 'اصفهان' },
    { value: 'kashan', label: 'کاشان' },
    { value: 'najafabad', label: 'نجف‌آباد' },
  ],
  // Add other cities...
}

export function AddressForm({ address, onSuccess, trigger }: AddressFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const form = useForm<AddressFormInput>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      title: address?.title || '',
      fullName: address?.fullName || '',
      phone: address?.phone || '',
      province: address?.province || '',
      city: address?.city || '',
      district: address?.district || '',
      address: address?.address || '',
      postalCode: address?.postalCode || '',
      isDefault: address?.isDefault ?? false,
    },
  })

  const selectedProvince = form.watch('province')

  const handleSubmit = async (data: AddressFormInput) => {
    setLoading(true)
    try {
      if (address?.id) {
        await updateAddress(address.id, data)
        toast.success('آدرس با موفقیت ویرایش شد')
      } else {
        await createAddress(data)
        toast.success('آدرس با موفقیت اضافه شد')
      }
      setOpen(false)
      onSuccess?.()
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطا در ذخیره آدرس')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            افزودن آدرس جدید
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {address ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}
          </DialogTitle>
          <DialogDescription>
            اطلاعات آدرس خود را وارد کنید
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <FormField
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان آدرس</FormLabel>
                    <FormControl>
                      <Input placeholder="مثل: منزل، محل کار" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Full Name */}
              <FormField
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="نام کامل گیرنده" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره تلفن</FormLabel>
                    <FormControl>
                      <Input placeholder="09xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Province */}
              <FormField
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>استان</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب استان" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.value} value={province.value}>
                            {province.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شهر</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!selectedProvince}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب شهر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedProvince && cities[selectedProvince as keyof typeof cities]?.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* District */}
              <FormField
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محله (اختیاری)</FormLabel>
                    <FormControl>
                      <Input placeholder="نام محله" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Postal Code */}
              <FormField
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد پستی</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آدرس کامل</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="آدرس کامل شامل خیابان، کوچه، پلاک و واحد"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Default */}
            <FormField
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      تنظیم به عنوان آدرس پیش‌فرض
                    </FormLabel>
                    <FormDescription>
                      این آدرس در فرآیند خرید به صورت پیش‌فرض انتخاب می‌شود
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                {address ? 'ویرایش آدرس' : 'ذخیره آدرس'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
