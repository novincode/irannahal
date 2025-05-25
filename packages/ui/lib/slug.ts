// Persian-aware slugify and validation utilities

/**
 * Slugifies a string, supporting Persian and English, replacing spaces and invalid chars with '-'.
 * Keeps Persian/Arabic/English letters, numbers, and dashes.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .replace(/[\s\u200C]+/g, '-') // Replace spaces and ZWNJ with dash
    .replace(/[^\p{L}\p{N}-]+/gu, '') // Remove anything except letters, numbers, dash
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-+|-+$/g, '') // Trim dashes from start/end
}

/**
 * Checks if a slug is valid (Persian/English letters, numbers, dashes, no leading/trailing dash, no double dash)
 */
export function isValidSlug(slug: string): boolean {
  // Accept Persian/Arabic/English letters, numbers, dashes, no leading/trailing dash, no double dash
  return /^([\p{L}\p{N}]+(-[\p{L}\p{N}]+)*)$/u.test(slug)
}
