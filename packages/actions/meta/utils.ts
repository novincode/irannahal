// Meta field utilities for flattening and transforming meta data

export interface MetaFieldRow {
  key: string
  value: any
}

/**
 * Flatten nested meta object into array of key-value pairs
 * Converts nested objects like { dimensions: { width: 10 } } to [{ key: "dimensions.width", value: "10" }]
 */
export function flattenMeta(meta: Record<string, any>): MetaFieldRow[] {
  const result: MetaFieldRow[] = []

  function flatten(obj: any, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (value === null || value === undefined) {
        // Store null/undefined as empty string
        result.push({
          key: fullKey,
          value: ''
        })
      } else if (Array.isArray(value)) {
        // Store arrays as JSON strings
        result.push({
          key: fullKey,
          value: JSON.stringify(value)
        })
      } else if (typeof value === 'object') {
        // Recursively flatten nested objects
        flatten(value, fullKey)
      } else {
        // Add primitive values
        result.push({
          key: fullKey,
          value: value
        })
      }
    }
  }

  flatten(meta)
  return result
}

/**
 * Convert meta rows back to nested object
 * Converts [{ key: "dimensions.width", value: "10" }] to { dimensions: { width: 10 } }
 */
export function metaRowsToObject(rows: { key: string; value: string | null }[]): Record<string, any> {
  const result: Record<string, any> = {}

  for (const { key, value } of rows) {
    const keys = key.split('.')
    let current = result

    // Navigate/create nested structure
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!(k in current)) {
        current[k] = {}
      }
      current = current[k]
    }

    // Set the final value
    const finalKey = keys[keys.length - 1]
    
    // Try to parse value as JSON (for arrays and objects), otherwise use as-is
    if (value === null || value === '') {
      current[finalKey] = null
    } else {
      try {
        // Check if it looks like JSON (starts with [ or {)
        if ((value.startsWith('[') && value.endsWith(']')) || 
            (value.startsWith('{') && value.endsWith('}'))) {
          current[finalKey] = JSON.parse(value)
        } else {
          current[finalKey] = value
        }
      } catch {
        // If JSON parsing fails, use the raw value
        current[finalKey] = value
      }
    }
  }

  return result
}

/**
 * Merge multiple meta objects, with later objects overriding earlier ones
 */
export function mergeMeta(...metaObjects: Record<string, any>[]): Record<string, any> {
  const result: Record<string, any> = {}

  for (const meta of metaObjects) {
    if (meta && typeof meta === 'object') {
      Object.assign(result, meta)
    }
  }

  return result
}
