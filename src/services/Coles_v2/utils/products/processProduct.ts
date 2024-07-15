import type { Product, ProductCallbacks } from "../../../types";
import type { ColesProduct, ImageUri } from "../../types";
import getProductBarcode from "./getProductBarcode";


const COLES_IMAGE_BASE_URL = 'https://www.coles.com.au/_next/image?url=https://productimages.coles.com.au/productimages'

const formatImages = (imageUris: ImageUri[]): string[] => {
  return imageUris.map(image => `${COLES_IMAGE_BASE_URL}${image.uri}&w=256&q=90`)
}

export const processProduct = async (product: ColesProduct, callbacks?: Partial<ProductCallbacks>): Promise<Product | undefined> => {
  if (product._type !== 'PRODUCT') return

  try {
    callbacks?.onRawProduct?.(product)
  
    const productURL = `${product.description.toLocaleLowerCase().replace(/ /g, '-')}-${product.id}`
    const barcode = await getProductBarcode(product.id)

    const pricing = product.availability ? product.pricing : { now: 0, was: 0, unit: { ofMeasureType: 'unknown' } }
  
    const newProduct: Product = {
      retailer_id: product.id.toString(),
      retailer_url: productURL,
      barcode,
      name: product.name,
      brand: product.brand,
      description: product.description,
      images: formatImages(product.imageUris),
      price: pricing.now,
      was_price: pricing.was || pricing.now,
      unit: pricing.unit?.ofMeasureType || 'unknown',
      category: product.onlineHeirs[0]?.category,
      subcategory: product.onlineHeirs[0]?.subCategory
    }
  
    callbacks?.onProduct?.(newProduct)
  
    return newProduct
  } catch (err) {
    console.log(err)
    console.log('Error processing product', product)
    callbacks?.onProductError?.(err as Error)
  }
}

export default processProduct