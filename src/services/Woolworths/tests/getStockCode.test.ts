import { test, describe, expect } from 'bun:test'

import { getStockCode } from '../utils/getStockCode';

describe('Woolworths getStockCode', () => {
  test('Gets Woolworths stock code', async () => {
    const url = 'https://www.woolworths.com.au/shop/productdetails/123456/some-string'
    const stockCode = await getStockCode(url)
    expect(stockCode).toBe('123456')
  })
})