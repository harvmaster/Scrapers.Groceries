import type { Product, ShopProductURL } from "./types";

import getStockCode from "./getStockCode";
import getDetailsURL from "./getDetailsURL";
import getProductDetails from "./getProductDetails";

import analytics from "../../lib/Analytics";

const storeProductAnalytics = async (productURL: ShopProductURL, product: Product) => {
  analytics.insert({
    timestamp: new Date(),
    status: 'success',
    productURL: productURL,
    product
  })
}

const storeErrorAnalytics = async (productURL: ShopProductURL, error: Error) => {
  analytics.insert({
    timestamp: new Date(),
    status: 'error',
    productURL: productURL,
    error
  })
}

export const processProduct = async (productURL: ShopProductURL): Promise<Product | undefined> => {
  const stockCode = getStockCode(productURL)
  const detailsURL = getDetailsURL(stockCode)

  try {
    const product = await getProductDetails(detailsURL)

    // Collect analytics
    storeProductAnalytics(productURL, product)

    return product
  } catch  (err) {
    // Collect analytics
    storeErrorAnalytics(productURL, err as Error)

    return undefined
  }
}

export default processProduct

