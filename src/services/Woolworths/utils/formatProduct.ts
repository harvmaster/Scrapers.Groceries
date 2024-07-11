import type { WoolworthsProduct, Product } from "../types";

export const formatProduct = (url: string, product: WoolworthsProduct): Product => {
  return {
    retailer_id: product.Stockcode.toString(),
    retailer_url: url,
    barcode: product.Barcode,

    name: product.Name,
    description: product.Description,
    brand: product.Brand,

    price: product.Price,
    was_price: product.WasPrice,
    unit: product.Unit,
    
    images: product.DetailsImagePaths,
    
    category: product.SapCategories.SapCategoryName,
    subcategory: product.SapCategories.SapSubCategoryName,
  };
}

export default formatProduct