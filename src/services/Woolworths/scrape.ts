import type { Product } from './types';

import { sitemaps } from './Woolworths';

import extractFromSitemap from "./extractFromSitemap";
import processProduct from './processProduct';

import RateLimitQueue from '../../lib/rateLimiter';


export const scrapeWoolworths = async (limit?: number): Promise<Product[]> => {
  const products = await extractFromSitemap(sitemaps[0])
  
  const limitedProducts = products.slice(0, limit)
  // console.log(limitedProducts)

  const rateLimiter = new RateLimitQueue(10, 250)

  const productPromises = limitedProducts.map(async (productURL) => {
    const product = await rateLimiter.add(() => processProduct(productURL))
    return product
  })

  const res = await Promise.all(productPromises)
  return res.filter((product) => product !== undefined)
}

export default scrapeWoolworths