import { registerBlock } from '../blockRegistry'
import { 
  MainInfoBlock,
  StatusBlock, 
  CategoriesBlock,
  TagsBlock,
  MetaBlock,
  MediaBlock,
  ThumbnailBlock,
  InfoTableBlock,
  DownloadsBlock,
  ContentBlock
} from '../blocks'

// ==========================================
// PRODUCT BLOCKS REGISTRATION
// ==========================================

export function registerProductBlocks() {
  // Status Block - Left column, always visible
  registerBlock({
    id: 'status',
    title: 'وضعیت انتشار',
    category: 'core',
    component: StatusBlock,
    supports: {
      required: true,
      postTypes: ['product', 'post', 'page'],
      placement: 'left'
    }
  })

  // Categories Block - Left column
  registerBlock({
    id: 'categories',
    title: 'دسته‌بندی‌ها',
    category: 'relations',
    component: CategoriesBlock,
    supports: {
      postTypes: ['product', 'post'],
      placement: 'left'
    }
  })

  // Tags Block - Left column
  registerBlock({
    id: 'tags',
    title: 'برچسب‌ها',
    category: 'relations',
    component: TagsBlock,
    supports: {
      postTypes: ['product', 'post'],
      placement: 'left'
    }
  })

  // Thumbnail/Featured Image - Left column
  registerBlock({
    id: 'thumbnail',
    title: 'تصویر شاخص',
    category: 'media',
    component: ThumbnailBlock,
    supports: {
      postTypes: ['product', 'post', 'page'],
      placement: 'left'
    }
  })

  // Main Info Block - Right column, always visible
  registerBlock({
    id: 'mainInfo',
    title: 'اطلاعات کلی',
    category: 'core',
    component: MainInfoBlock,
    supports: {
      required: true,
      postTypes: ['product', 'post', 'page'],
      placement: 'right'
    }
  })

  // Content Block - Right column
  registerBlock({
    id: 'content',
    title: 'محتوا',
    category: 'core',
    component: ContentBlock,
    supports: {
      postTypes: ['product', 'post', 'page'],
      placement: 'right'
    }
  })

  // Meta/Attributes Block - Right column
  registerBlock({
    id: 'meta',
    title: 'ویژگی‌ها و تنظیمات',
    category: 'meta',
    component: MetaBlock,
    supports: {
      postTypes: ['product', 'post', 'page'],
      placement: 'right'
    }
  })

  // Info Table Block - Right column (mainly for products)
  registerBlock({
    id: 'infoTable',
    title: 'جدول مشخصات',
    category: 'meta',
    component: InfoTableBlock,
    supports: {
      postTypes: ['product'],
      placement: 'right'
    }
  })

  // Gallery/Media Block - Right column
  registerBlock({
    id: 'gallery',
    title: 'گالری تصاویر',
    category: 'media',
    component: MediaBlock,
    supports: {
      postTypes: ['product', 'post'],
      placement: 'right'
    }
  })

  // Downloads Block - Right column
  registerBlock({
    id: 'downloads',
    title: 'فایل‌های قابل دانلود',
    category: 'meta',
    component: DownloadsBlock,
    supports: {
      postTypes: ['product', 'post'],
      placement: 'right'
    }
  })
}

// ==========================================
// DEFAULT LAYOUTS
// ==========================================

export const DEFAULT_PRODUCT_LAYOUT = {
  left: [
    { id: 'status-1', blockType: 'status' },
    { id: 'categories-1', blockType: 'categories' },
    { id: 'tags-1', blockType: 'tags' },
    { id: 'thumbnail-1', blockType: 'thumbnail' }
  ],
  right: [
    { id: 'mainInfo-1', blockType: 'mainInfo' },
    { id: 'content-1', blockType: 'content' },
    { id: 'meta-1', blockType: 'meta' },
    { id: 'infoTable-1', blockType: 'infoTable' },
    { id: 'gallery-1', blockType: 'gallery' },
    { id: 'downloads-1', blockType: 'downloads' }
  ]
}

export const DEFAULT_POST_LAYOUT = {
  left: [
    { id: 'status-1', blockType: 'status' },
    { id: 'categories-1', blockType: 'categories' },
    { id: 'tags-1', blockType: 'tags' },
    { id: 'thumbnail-1', blockType: 'thumbnail' }
  ],
  right: [
    { id: 'mainInfo-1', blockType: 'mainInfo' },
    { id: 'content-1', blockType: 'content' },
    { id: 'meta-1', blockType: 'meta' },
    { id: 'downloads-1', blockType: 'downloads' }
  ]
}

export const DEFAULT_PAGE_LAYOUT = {
  left: [
    { id: 'status-1', blockType: 'status' },
    { id: 'thumbnail-1', blockType: 'thumbnail' }
  ],
  right: [
    { id: 'mainInfo-1', blockType: 'mainInfo' },
    { id: 'content-1', blockType: 'content' },
    { id: 'meta-1', blockType: 'meta' }
  ]
}
