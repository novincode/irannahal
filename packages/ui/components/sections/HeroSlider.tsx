'use client'
import React from 'react'
import Link from 'next/link'
import { Button } from '@shadcn/button'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export interface SliderItem {
  node: React.ReactNode
}

const slides: SliderItem[] = [
  {
    node: (
      <div className="flex flex-col items-center justify-center h-64 bg-card gap-4">
        <h2 className="text-2xl font-bold">اسلاید اول</h2>
        <Button asChild variant="default" size="lg">
          <Link href="/products">مشاهده محصولات</Link>
        </Button>
      </div>
    ),
  },
  {
    node: (
      <div className="flex flex-col items-center justify-center h-64 bg-card gap-4">
        <h2 className="text-2xl font-bold">اسلاید دوم</h2>
        <Button asChild variant="secondary" size="lg">
          <Link href="/about">درباره ما</Link>
        </Button>
      </div>
    ),
  },
]

const HeroSlider: React.FC = () => {
  return (
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        dir="rtl"
        style={{ direction: 'rtl' }}
        className="rounded-xl overflow-hidden"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>{slide.node}</SwiperSlide>
        ))}
      </Swiper>
  )
}

export default HeroSlider