'use client'
import React from "react"
import { ProductForm } from "@ui/components/admin/products/ProductForm"
import { createProduct } from "@actions/products/create"
import { ProductFormInput } from "@actions/products/formSchema"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

const Page = () => {
  const router = useRouter()
  const handleSubmit = async (data: ProductFormInput) => {
    const product = await createProduct(data)
    if (product?.id) {
      toast.success("محصول با موفقیت ایجاد شد.")
      router.push(`/products/${product.id}/edit`)
    } else {
      toast.error("خطا در ایجاد محصول. لطفا مجددا تلاش کنید.")
    }
    // Optionally, add notification here
  }
  return <ProductForm onSubmit={handleSubmit} />
}

export default Page