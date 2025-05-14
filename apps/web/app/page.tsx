import React from 'react'
import { Button } from '@shadcn/button'
import Logo from '@ui/components/shared/Logo'
const page = () => {
  return (
    <div>
      <Button className='' variant={'default'}>Test</Button>
      <div className='text-2xl'>
        TEST
      </div>
      <div>
        <Logo />
        <h1 className='text-4xl font-bold'>ایران نهال</h1>
        <p className='text-gray-500'>ایران نهال یک وبسایت برای فروش نهال و درختان میوه است.</p>
      </div>
    </div>
  )
}

export default page
