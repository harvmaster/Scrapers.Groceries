import type { ProductDetailsURL, Product, ProductDetailsResponse } from "./types";
import FetchInstance from "./fetchInstance";

export const getProductDetails = async (url: ProductDetailsURL): Promise<Product> => {
  const response = await FetchInstance.fetch(url + '?isMobile=false&useVariant=true')

  if (!response.ok) {
    throw new Error(`Failed to fetch product details: ${url}\n ${response}`)
  }

  const data = await response.json() as ProductDetailsResponse

  return data.Product
}

export default getProductDetails