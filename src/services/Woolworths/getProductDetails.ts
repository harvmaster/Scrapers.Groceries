import type { ProductDetailsURL, Product, ProductDetailsResponse } from "./types";


export const getProductDetails = async (url: ProductDetailsURL): Promise<Product> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch product details: ${url}`)
  }

  const data = await response.json() as ProductDetailsResponse

  return data.Product
}

export default getProductDetails