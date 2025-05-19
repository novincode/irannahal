import React from 'react'
import { getProducts } from "@actions/products/get"
import ProductsDataTable from "@ui/components/admin/products/ProductsDataTable"
import { ProductSchema as Product } from "@db/types"

const page = async () => {
  const products: Product[] = await getProducts()
  return <ProductsDataTable data={products} />
}

export default page