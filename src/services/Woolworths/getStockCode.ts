import type { ShopBaseURL, StockCode } from './types'

export const getStockCode = <T extends StockCode>(url: `${ShopBaseURL}/${T}/${string}`): T => {
  const stockCode = url.split('/')[5]
  return stockCode as T
}

export default getStockCode

const url = 'https://www.woolworths.com.au/shop/productdetails/123456/abc'
const URI = 'https://base.com/123456/test' as const

const t = getStockCode(url)