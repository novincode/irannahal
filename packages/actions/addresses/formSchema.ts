import { z } from "zod"

export const addressFormSchema = z.object({
  title: z.string().min(1, "عنوان آدرس الزامی است"),
  fullName: z.string().min(1, "نام و نام خانوادگی الزامی است"),
  phone: z.string().min(10, "شماره تلفن باید حداقل ۱۰ رقم باشد"),
  province: z.string().min(1, "انتخاب استان الزامی است"),
  city: z.string().min(1, "انتخاب شهر الزامی است"),
  district: z.string().optional(),
  address: z.string().min(10, "آدرس باید حداقل ۱۰ کاراکتر باشد"),
  postalCode: z.string().min(10, "کد پستی باید ۱۰ رقم باشد").max(10, "کد پستی باید ۱۰ رقم باشد"),
  isDefault: z.boolean().optional(),
})

export type AddressFormInput = z.infer<typeof addressFormSchema>
