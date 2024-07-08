import type { ProductDetailsURL, Product, ProductDetailsResponse } from "./types";
import FetchInstance from "./FetchInstance";

export const getProductDetails = async (url: ProductDetailsURL): Promise<Product> => {
  const response = await FetchInstance.fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch product details: ${url}`)
  }

  const data = await response.json() as ProductDetailsResponse

  return data.Product
}

export default getProductDetails