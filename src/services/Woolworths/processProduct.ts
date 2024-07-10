import type { Product, ProductCallbacks, ScrapingCallbacks, ShopProductURL } from "./types";

import getStockCode from "./getStockCode";
import getDetailsURL from "./getDetailsURL";
import getProductDetails from "./getProductDetails";


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

