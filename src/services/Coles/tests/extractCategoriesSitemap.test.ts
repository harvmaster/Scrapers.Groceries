import { test, describe, expect } from 'bun:test'

import { extractCategoriesSitemap } from '../utils/categories/extractCategoriesSitemap'

describe('extractCategoriesSitemap', () => {
  test('should extract categories from sitemap', () => {
    const categories = extractCategoriesSitemap()

    expect(categories).toHaveLength(10)
  })
})
