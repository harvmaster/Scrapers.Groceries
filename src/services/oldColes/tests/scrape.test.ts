import { test, describe, expect } from 'bun:test'

import scrapeColes from '../scrape'

describe('Coles scrape', () => {
  test('Gets Coles products', async () => {
    const products = await scrapeColes()

    expect(products).toBeTruthy()
    expect(products.length).toBeGreaterThan(0)
  })
})