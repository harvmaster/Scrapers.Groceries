import type { ShopBaseURL, StockCode } from '../types'

export const getStockCode = <T extends StockCode>(url: `${ShopBaseURL}/${T}/${string}`): T => {
  const stockCode = url.split('/')[5]
  return stockCode as T
}

export default getStockCode