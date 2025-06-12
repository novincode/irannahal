import type { BlockDefinition } from '@data/usePostEditorStore'

// ==========================================
// BLOCK REGISTRY
// ==========================================

class BlockRegistry {
  private blocks = new Map<string, BlockDefinition>()
  
  register(definition: BlockDefinition) {
    this.blocks.set(definition.id, definition)
  }
  
  unregister(blockId: string) {
    this.blocks.delete(blockId)
  }
  
  get(blockId: string): BlockDefinition | undefined {
    return this.blocks.get(blockId)
  }
  
  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values())
  }
  
  getByCategory(category: BlockDefinition['category']): BlockDefinition[] {
    return this.getAll().filter(block => block.category === category)
  }
  
  getForPostType(postType: string): BlockDefinition[] {
    return this.getAll().filter(block => 
      !block.supports.postTypes || 
      block.supports.postTypes.includes(postType)
    )
  }
  
  clear() {
    this.blocks.clear()
  }
}

export const blockRegistry = new BlockRegistry()

// ==========================================
// UTILITIES
// ==========================================

export function registerBlock(definition: BlockDefinition) {
  blockRegistry.register(definition)
}

export function getBlock(blockId: string) {
  return blockRegistry.get(blockId)
}

export function getAllBlocks() {
  return blockRegistry.getAll()
}

export function getBlocksForPostType(postType: string) {
  return blockRegistry.getForPostType(postType)
}

export function getBlocksByCategory(category: BlockDefinition['category']) {
  return blockRegistry.getByCategory(category)
}
