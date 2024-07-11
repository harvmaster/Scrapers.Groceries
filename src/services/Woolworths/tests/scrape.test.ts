import { expect, test, describe } from 'bun:test'
import scrapeWoolworths from '../scrape'

import analytics from '../../../lib/analytics'

describe('Woolworths scrape', () => {
  test('Gets Woolworths products', async () => {
    const products = await scrapeWoolworths(40)

    await analytics.toJSONFile()

    expect(products).toBeTruthy()
    expect(products.length).toBeGreaterThan(0)
  }, {
    timeout: 30000
  })
})