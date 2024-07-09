import { expect, test, describe } from 'bun:test'
import scrapeWoolworths from '../scrape'

import analytics from '../../../lib/Analytics'

describe('Woolworths scrape', () => {
  test('Gets Woolworths products', async () => {
    const products = await scrapeWoolworths(40)

    const formatted = products.map(product => {
      return {
        Name: product.Name,
        Price: product.Price,
        Barcode: product.Barcode,
        DetailsImagePaths: product.DetailsImagePaths[0]
      }
    })

    // console.log(formatted)

    await analytics.toJSONFile()

    expect(products).toBeTruthy()
    expect(products.length).toBeGreaterThan(0)
  }, {
    timeout: 30000
  })
})