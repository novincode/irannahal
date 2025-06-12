import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { ZodSchema } from 'zod'

// ==========================================
// TYPES
// ==========================================

export interface BlockDefinition {
  id: string
  title: string
  category: 'core' | 'meta' | 'relations' | 'media' | 'custom'
  component: React.ComponentType<BlockProps>
  schema?: ZodSchema
  supports: {
    multiple?: boolean
    required?: boolean
    postTypes?: string[]
    placement?: 'left' | 'right' | 'both'
  }
}

export interface BlockProps {
  control: any
  postType: string
  blockId: string
  onUpdate?: (path: string, value: any) => void
}

export interface PostEditorColumn {
  id: 'left' | 'right'
  blocks: Array<{ id: string; blockType: string }>
}

export interface PostEditorState {
  // Core post data
  postType: string
  postData: Record<string, any>
  originalData: Record<string, any>
  isDirty: boolean
  
  // UI State
  activeTab: string
  layout: {
    left: Array<{ id: string; blockType: string }>
    right: Array<{ id: string; blockType: string }>
  }
  
  // Block Registry
  registeredBlocks: Map<string, BlockDefinition>
  visibleBlocks: string[]
  blockProps: Record<string, any>
  
  // Loading states
  isLoading: boolean
  isSaving: boolean
  
  // Actions
  initialize: (postType: string, initialData?: Record<string, any>) => void
  updateField: (path: string, value: any) => void
  resetForm: () => void
  setActiveTab: (tab: string) => void
  addBlock: (blockType: string, column: 'left' | 'right', position?: number) => void
  removeBlock: (blockId: string) => void
  moveBlock: (blockId: string, toColumn: 'left' | 'right', position: number) => void
  registerBlock: (definition: BlockDefinition) => void
  unregisterBlock: (blockType: string) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  markDirty: () => void
  markClean: () => void
  setLayout: (layout: { left: Array<{ id: string; blockType: string }>; right: Array<{ id: string; blockType: string }> }) => void
  setBlockProps: (props: Record<string, any>) => void
  subscribe: (selector: (state: PostEditorState) => any, callback: (value: any) => void) => () => void
}

// ==========================================
// STORE
// ==========================================

const storeImpl = (set: any, get: any) => ({
  // Initial state
  postType: '',
  postData: {},
  originalData: {},
  isDirty: false,
  activeTab: '',
  layout: {
    left: [] as Array<{ id: string; blockType: string }>,
    right: [] as Array<{ id: string; blockType: string }>
  },
  registeredBlocks: new Map<string, BlockDefinition>(),
  visibleBlocks: [] as string[],
  blockProps: {} as Record<string, any>,
  isLoading: false,
  isSaving: false,

  // Subscribe method for external components - will be set after store creation
  subscribe: (selector: (state: PostEditorState) => any, callback: (value: any) => void): (() => void) => {
    return () => {}
  },

  // Actions
  initialize: (postType: string, initialData = {}) => {
    set({
      postType,
      postData: { ...initialData },
      originalData: { ...initialData },
      isDirty: false,
      isLoading: false,
      isSaving: false,
      layout: getDefaultLayoutForPostType(postType)
    })
  },

  updateField: (path: string, value: any) => {
    set((state: PostEditorState) => {
      const newData = { ...state.postData }
      setNestedValue(newData, path, value)
      
      return {
        postData: newData,
        isDirty: !deepEqual(newData, state.originalData)
      }
    })
  },

  resetForm: () => {
    const { originalData } = get()
    set({
      postData: { ...originalData },
      isDirty: false
    })
  },

  setActiveTab: (tab: string) => set({ activeTab: tab }),

  addBlock: (blockType: string, column: 'left' | 'right', position?: number) => {
    set((state: PostEditorState) => {
      const blockId = `${blockType}-${Date.now()}`
      const newBlock = { id: blockId, blockType }
      const columnBlocks = [...state.layout[column]]
      
      if (position !== undefined) {
        columnBlocks.splice(position, 0, newBlock)
      } else {
        columnBlocks.push(newBlock)
      }

      return {
        layout: {
          ...state.layout,
          [column]: columnBlocks
        }
      }
    })
  },

  removeBlock: (blockId: string) => {
    set((state: PostEditorState) => {
      const newLayout = {
        left: state.layout.left.filter((block: any) => block.id !== blockId),
        right: state.layout.right.filter((block: any) => block.id !== blockId)
      }
      return { layout: newLayout }
    })
  },

  moveBlock: (blockId: string, toColumn: 'left' | 'right', position: number) => {
    set((state: PostEditorState) => {
      // Find and remove the block from current position
      let blockToMove: { id: string; blockType: string } | null = null
      const newLeft = state.layout.left.filter((block: any) => {
        if (block.id === blockId) {
          blockToMove = block
          return false
        }
        return true
      })
      const newRight = state.layout.right.filter((block: any) => {
        if (block.id === blockId) {
          blockToMove = block
          return false
        }
        return true
      })

      if (!blockToMove) return state

      // Add to new position
      const targetColumn = toColumn === 'left' ? newLeft : newRight
      targetColumn.splice(position, 0, blockToMove)

      return {
        layout: {
          left: newLeft,
          right: newRight
        }
      }
    })
  },

  registerBlock: (definition: BlockDefinition) => {
    set((state: PostEditorState) => {
      const newBlocks = new Map(state.registeredBlocks)
      newBlocks.set(definition.id, definition)
      return { registeredBlocks: newBlocks }
    })
  },

  unregisterBlock: (blockType: string) => {
    set((state: PostEditorState) => {
      const newBlocks = new Map(state.registeredBlocks)
      newBlocks.delete(blockType)
      return { registeredBlocks: newBlocks }
    })
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setSaving: (saving: boolean) => set({ isSaving: saving }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  setLayout: (layout: { left: Array<{ id: string; blockType: string }>; right: Array<{ id: string; blockType: string }> }) => set({ layout }),
  setBlockProps: (props: Record<string, any>) => set({ blockProps: { ...get().blockProps, ...props } })
})

export const usePostEditorStore = create<PostEditorState>()(
  subscribeWithSelector(storeImpl)
)

// Update the subscribe method after store creation
const originalStore = usePostEditorStore.getState()
originalStore.subscribe = (selector: (state: PostEditorState) => any, callback: (value: any) => void) => {
  return usePostEditorStore.subscribe(selector, callback)
}

// ==========================================
// UTILITIES
// ==========================================

function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
        return false
      }
    }
    
    return true
  }
  
  return false
}

function getDefaultLayoutForPostType(postType: string) {
  // Default layouts for different post types
  const layouts = {
    product: {
      left: [
        { id: 'status-1', blockType: 'core/status' },
        { id: 'categories-1', blockType: 'relations/categories' },
        { id: 'tags-1', blockType: 'relations/tags' },
        { id: 'thumbnail-1', blockType: 'media/thumbnail' }
      ],
      right: [
        { id: 'main-info-1', blockType: 'core/main-info' },
        { id: 'meta-1', blockType: 'meta/product-fields' },
        { id: 'discounts-1', blockType: 'meta/discounts' },
        { id: 'downloads-1', blockType: 'meta/downloads' }
      ]
    },
    post: {
      left: [
        { id: 'status-1', blockType: 'core/status' },
        { id: 'categories-1', blockType: 'relations/categories' },
        { id: 'tags-1', blockType: 'relations/tags' },
        { id: 'thumbnail-1', blockType: 'media/thumbnail' }
      ],
      right: [
        { id: 'main-info-1', blockType: 'core/main-info' },
        { id: 'excerpt-1', blockType: 'core/excerpt' },
        { id: 'seo-1', blockType: 'meta/seo' }
      ]
    }
  }

  return layouts[postType as keyof typeof layouts] || layouts.post
}
