import { test, describe, expect, mock } from 'bun:test'
import processProduct from '../utils/processProduct'
import type { Product } from '../types'

describe('Woolworths processProduct', () => {
  test('Processes Woolworths product', async () => {
    const url = 'https://www.woolworths.com.au/shop/productdetails/233833/allen-s-minties-mint-chewy-lollies-family-size-bag'
    const product = await processProduct(url)
    expect(product).toBeTruthy()
    expect(product?.name).toBeTruthy()
    expect(product?.price).toBeTruthy()
    expect(product?.barcode).toBeTruthy()
    expect(product?.images[0]).toBeTruthy()
  })

  test('Process Woolworths product with callbacks', async () => {
    const url = 'https://www.woolworths.com.au/shop/productdetails/233833/allen-s-minties-mint-chewy-lollies-family-size-bag'

    let beforeProductCalled = false
    const beforeProduct = mock((data: string) => {
      beforeProductCalled = true
    })

    let onProductSuccessCalled = false
    const onProductSuccess = mock((data: Product) => {
      onProductSuccessCalled = true
    })

    let onProductDetailsCalled = false
    const onProductError = mock((data: Error) => {
      onProductDetailsCalled = true
    })

    await processProduct(url, {
      beforeProduct,
      onProductSuccess,
      onProductError
    })

    expect(beforeProductCalled).toBe(true)
    expect(beforeProduct).toHaveBeenCalled()

    expect(onProductSuccessCalled).toBe(true)
    expect(onProductSuccess).toHaveBeenCalled()

    expect(onProductDetailsCalled).toBe(false)
    expect(onProductError).not.toHaveBeenCalled()
  })
})