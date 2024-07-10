import type { Product, ScrapingCallbacks } from './types';

import { sitemaps } from './Woolworths';

import extractFromSitemap from "./extractFromSitemap";
import processProduct from './processProduct';

import RateLimitQueue from '../../lib/rateLimiter';

export const scrapeWoolworths = async (limit?: number, callbacks?: ScrapingCallbacks): Promise<Product[]> => {
  const sitemapPromises = sitemaps.map(sitemap => extractFromSitemap(sitemap, callbacks))
  const sitemapsData = (await Promise.all(sitemapPromises)).flat()

  callbacks?.onProductURLS?.(sitemapsData)
  
  const limitedProducts = sitemapsData.slice(0, limit)
  // console.log(limitedProducts)

  const rateLimiter = new RateLimitQueue(10, 250)

  const productPromises = limitedProducts.map(async (productURL) => {
    const productCallacks = callbacks?.generateProductCallbacks?.() || callbacks
    const product = await rateLimiter.add(() => processProduct(productURL, productCallacks))
    return product
  })

  const res = await Promise.all(productPromises)
  return res.filter((product) => product !== undefined)
}

export default scrapeWoolworths