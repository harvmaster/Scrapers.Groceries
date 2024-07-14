import { test, describe, expect } from 'bun:test'

import scrapeColes from '../scrape'

describe('Coles scrape', () => {
  test('Gets Coles products', async () => {
    const products = await scrapeColes({
      limit: 3,
      callbacks: [{
        onProgress: (val: number) => {
          console.log('Progress: ', val)
        }
      }]
    })

    expect(products).toBeTruthy()
    expect(products.length).toBeGreaterThan(0)
  }, {
    timeout: 30000
  })
})