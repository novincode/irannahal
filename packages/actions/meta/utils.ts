// Utility to flatten meta fields for ACF-style meta storage (deep)
export function flattenMeta(meta: any, prefix = ""): Array<{ key: string, value: any }> {
  const result: Array<{ key: string, value: any }> = [];
  for (const [k, v] of Object.entries(meta || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      // Store arrays as JSON string
      result.push({ key, value: JSON.stringify(v) });
    } else if (typeof v === "object" && v !== null) {
      // Recursively flatten objects
      result.push(...flattenMeta(v, key));
    } else {
      result.push({ key, value: v });
    }
  }
  return result;
}

// Utility to convert meta rows to a nested object (for initialData)
export function metaRowsToObject(rows: Array<{ key: string, value: string }>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const { key, value } of rows) {
    const keys = key.split('.')
    let curr = result
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) curr[keys[i]] = {}
      curr = curr[keys[i]]
    }
    // Try to parse JSON, fallback to string/primitive
    let parsed: any = value
    try {
      parsed = JSON.parse(value)
    } catch {}
    curr[keys[keys.length - 1]] = parsed
  }
  return result
}
