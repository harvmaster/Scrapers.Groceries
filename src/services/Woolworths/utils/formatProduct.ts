import type { WoolworthsProduct, Product } from "../types";
import formatText from "../../../lib/text";

export const formatProduct = (url: string, product: WoolworthsProduct): Product => {
  return {
    retailer: 'Woolworths',
    retailer_id: product.Stockcode.toString(),
    retailer_url: url,
    barcode: product.Barcode,

    name: product.Name,
    description: formatText(product.Description),
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