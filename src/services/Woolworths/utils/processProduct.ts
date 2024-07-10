import type { Product, ProductCallbacks, ShopProductURL } from "../types";

import getStockCode from "./getStockCode";
import getDetailsURL from "./getDetailsURL";
import getProductDetails from "./getProductDetails";


export const processProduct = async (productURL: ShopProductURL, callbacks?: ProductCallbacks): Promise<Product | undefined> => {
  // Extract the stock code from the URL
  const stockCode = getStockCode(productURL)

  // Generate the details URL
  const detailsURL = getDetailsURL(stockCode)

  // Call the callback for the product. This can be used for analytics, progress tracking, etc.
  callbacks?.beforeProduct?.(detailsURL)

  // Scrape the product details and call the callbacks. Return the product
  try {
    const product = await getProductDetails(detailsURL)
    callbacks?.onProductSuccess?.(product)

    return product
  } catch  (err) {
    callbacks?.onProductError?.(err as Error)
  }
}

export default processProduct

