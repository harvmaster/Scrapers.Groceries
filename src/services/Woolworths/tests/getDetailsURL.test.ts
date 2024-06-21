import { test, describe, expect } from 'bun:test'

import { getDetailsURL } from '../getDetailsURL';

describe('Woolworths getDetailsURL', () => {
  test('Generates Woolworths product details URL', () => {
    const stockCode = '123456'
    const detailsURL = getDetailsURL(stockCode)
    expect(detailsURL).toBe('https://www.woolworths.com.au/apis/ui/product/detail/123456')
  })
})