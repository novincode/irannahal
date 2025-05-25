'use client'
import { useState, useEffect } from "react"
import type { ProductWithDynamicRelations } from "@actions/products/types"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, Grid } from "swiper/modules"
import type { SwiperOptions } from 'swiper/types'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@shadcn/button"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/grid"
import { ProductCard } from "./ProductCard"

interface ProductsListProps {
  products: ProductWithDynamicRelations<{ thumbnail: true, meta?: true }>[]
  title?: string
  slidesPerView?: number | { base: number, sm: number, md: number, lg: number, xl: number }
  grid?: boolean
  rows?: number
  autoplay?: boolean | { delay: number, disableOnInteraction: boolean }
  loop?: boolean
  showNavigation?: boolean
  showPagination?: boolean
  spaceBetween?: number
  className?: string
  cardClassName?: string
  featured?: boolean
}

export default function ProductsList({
  products,
  title,
  slidesPerView = {
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  },
  grid = false,
  rows = 1,
  autoplay = false,
  loop = false,
  showNavigation = true,
  showPagination = false,
  spaceBetween = 24,
  className = "",
  cardClassName = "",
  featured = false
}: ProductsListProps) {
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch with Swiper
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // If no products, don't render anything
  if (!products?.length) return null
  
  // To avoid hydration errors, render a placeholder until client-side
  if (!mounted) {
    return <div className={`min-h-[320px] ${className}`}></div>
  }
  
  // Configure responsive breakpoints properly typed
  const breakpoints: SwiperOptions['breakpoints'] = typeof slidesPerView === 'object' ? {
    0: { slidesPerView: slidesPerView.base },
    640: { slidesPerView: slidesPerView.sm },
    768: { slidesPerView: slidesPerView.md },
    1024: { slidesPerView: slidesPerView.lg },
    1280: { slidesPerView: slidesPerView.xl }
  } : undefined
  
  // Configure modules to use
  const modules = [
    ...(showNavigation ? [Navigation] : []),
    ...(showPagination ? [Pagination] : []),
    ...(autoplay ? [Autoplay] : []),
    ...(grid && rows > 1 ? [Grid] : [])
  ]
  
  return (
    <div className={`products-list relative ${className}`}>
      {/* Title (if provided) */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          
          {/* Custom navigation buttons (if showNavigation is true) */}
          {showNavigation && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="swiper-button-prev h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="swiper-button-next h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      <Swiper
        modules={modules}
        spaceBetween={spaceBetween}
        slidesPerView={typeof slidesPerView === 'number' ? slidesPerView : slidesPerView.base}
        breakpoints={breakpoints}
        grid={grid && rows > 1 ? { rows } : undefined}
        navigation={showNavigation ? {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        } : false}
        pagination={showPagination ? { clickable: true } : false}
        autoplay={autoplay === true
          ? { delay: 4000, disableOnInteraction: false }
          : typeof autoplay === 'object'
            ? autoplay
            : false}
        loop={loop}
        dir="rtl"
        className="!pr-0.5 !pl-0.5 !pb-10" // Padding for shadow visibility
      >
        {products.map(product => (
          <SwiperSlide key={product.id}>
            <div className={`h-full p-0.5 ${cardClassName}`}>
              <ProductCard 
                product={product} 
                featured={featured}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
