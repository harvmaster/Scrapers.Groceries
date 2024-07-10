import { test, describe, expect } from 'bun:test'

import { getProductDetails } from '../utils/getProductDetails';

describe('Woolworths getProductDetails', () => {
  test('Gets Woolworths product details', async () => {
    const url = 'https://www.woolworths.com.au/apis/ui/product/detail/304350'
    const product = await getProductDetails(url)
    expect(product).toBeTruthy()
    expect(product.Name).toBeTruthy()
    expect(product.Price).toBeTruthy()
    expect(product.Barcode).toBeTruthy()
    expect(product.DetailsImagePaths[0]).toBeTruthy()
  })
})