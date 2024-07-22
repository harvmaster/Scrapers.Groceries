import type { ProductCallbacks } from "../../../types";
import type { ShopProductURL, Product } from "../types";

import getStockCode from "./getStockCode";
import getDetailsURL from "./getDetailsURL";
import getProductDetails from "./getProductDetails";
import formatProduct from "./formatProduct";


export const processProduct = async (productURL: ShopProductURL, callbacks?: Partial<ProductCallbacks>): Promise<Product | undefined> => {
  // Extract the stock code from the URL
  const stockCode = getStockCode(productURL)

  // Generate the details URL
  const detailsURL = getDetailsURL(stockCode)

  // Call the callback for the product. This can be used for analytics, progress tracking, etc.
  callbacks?.beforeProductRequest?.(detailsURL)

  // Scrape the product details and call the callbacks. Return the product
  try {
    const product = await getProductDetails(detailsURL)
    callbacks?.onRawProduct?.(product)

    // Format the product to standard shape and call the callback
    const formattedProduct = formatProduct(productURL, product)
    callbacks?.onProduct?.(formattedProduct)

    return formattedProduct
  } catch  (err) {
    callbacks?.onProductError?.(err as Error)
  }
}

export default processProduct

