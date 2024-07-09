import type { Product, ShopProductURL } from "./types";

import getStockCode from "./getStockCode";
import getDetailsURL from "./getDetailsURL";
import getProductDetails from "./getProductDetails";

import analytics from "../../lib/Analytics";

type SuccessfulAnalytic = {
  product: Product
}

type ErrorAnalytic = {
  error: Error
}

const createAnalytics = (productURL: string) => {
  const startTime = new Date()

  return (data: SuccessfulAnalytic | ErrorAnalytic) => {
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    const analytic = {
      timestamp: new Date(),
      duration,
      productURL,
      ...data
    }

    analytics.insert(analytic)
  }

}

export const processProduct = async (productURL: ShopProductURL): Promise<Product | undefined> => {
  const stockCode = getStockCode(productURL)
  const detailsURL = getDetailsURL(stockCode)

  const storeProductAnalytics = createAnalytics(productURL)

  try {
    const product = await getProductDetails(detailsURL)
    storeProductAnalytics({ product })

    return product
  } catch  (err) {
    storeProductAnalytics({ error: err as Error })
  }
}

export default processProduct

