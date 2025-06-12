import React from 'react'
import { Button } from '@ui/components/ui/button'
import Logo from '@ui/components/shared/Logo'
import HeroSlider from '@ui/components/sections/HeroSlider'
import ProductsList from '@ui/components/products/ProductsList'
import { getProducts } from '@actions/products/get'


const page = async () => {

  const products = await getProducts({
    with: {
      thumbnail: true,
      meta: true
    }
  })
  return (
    <div className='container'>
      <div className='grid grid-cols-1 md:grid-cols-3 p-4 gap-4'>
        <div className="col-span-2">
          <HeroSlider />
        </div>
        <div className='flex flex-col gap-4'>
          <Button variant={'success_ghost'} className='flex-auto text-lg'>
            نهال های مناسب فصل
          </Button>
          <Button variant={'success_outline'} className='flex-auto text-lg'>
            مشاهده تمام محصولات
          </Button>
        </div>
      </div>

      <ProductsList products={products} />
    </div>
  )
}

export default page
