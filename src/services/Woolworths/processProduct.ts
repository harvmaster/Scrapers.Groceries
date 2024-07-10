import type { Product, ProductCallbacks, ScrapingCallbacks, ShopProductURL } from "./types";

import getStockCode from "./getStockCode";
import getDetailsURL from "./getDetailsURL";
import getProductDetails from "./getProductDetails";

// type SuccessfulAnalytic = {
//   product: Product
//   error?: never
// }

// type ErrorAnalytic = {
//   error: Error
//   product?: never;
// }

// const createAnalytics = (productURL: string) => {
//   const startTime = new Date()

//   return (data: SuccessfulAnalytic | ErrorAnalytic) => {
//     const endTime = new Date()
//     const duration = endTime.getTime() - startTime.getTime()

//     const analytic = {
//       timestamp: new Date(),
//       description: 'item_scraped',
//       status: data.error ? 'error' : 'success',

//       data: {
//         duration,
//         productURL,
//         ...data
//       }
//     }

//     analytics.insert(analytic)
//   }

// }

export const processProduct = async (productURL: ShopProductURL, callbacks?: ProductCallbacks): Promise<Product | undefined> => {
  const stockCode = getStockCode(productURL)
  const detailsURL = getDetailsURL(stockCode)

  callbacks?.beforeProduct?.(detailsURL)

  try {
    const product = await getProductDetails(detailsURL)
    callbacks?.onProductSuccess?.(product)

    return product
  } catch  (err) {
    callbacks?.onProductError?.(err as Error)
  }
}

export default processProduct

