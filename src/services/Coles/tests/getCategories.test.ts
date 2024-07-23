import { test, describe, expect } from 'bun:test'

import { getCategories } from '../utils/categories/getCategories'

describe('getCategories', () => {
  test('should return categories', () => {
    const categories = getCategories()

    console.log(categories)

    expect(categories).toHaveLength(10)
  })
})