import React from 'react'
import { getAllProducts } from "@actions/products/get"
import ProductsDataTable from "@ui/components/admin/products/ProductsDataTable"
import { ProductSchema as Product } from "@db/types"

const page = async () => {
  const products: Product[] = await getAllProducts()
  return <ProductsDataTable data={products} />
}

export default page