import type { Product, ScrapingCallbacks } from './types';

import { sitemaps } from './Woolworths';

import extractFromSitemap from "./utils/extractFromSitemap";
import processProduct from './utils/processProduct';

import RateLimitQueue from '../../lib/rateLimiter';

export const scrapeWoolworths = async (limit?: number, callbacks?: ScrapingCallbacks): Promise<Product[]> => {
  // Scrape the Sitemap.xml
  const sitemapPromises = sitemaps.map(sitemap => extractFromSitemap(sitemap, callbacks))
  const productURLs = (await Promise.all(sitemapPromises)).flat()

  // Call the callback for the product URLs. This can be used for analytics, progress tracking, etc.
  callbacks?.onProductURLS?.(productURLs)
  
  // Limit the number of products to scrape
  const limitedProducts = productURLs.slice(0, limit)

  // Create a rate limiter to limit the number of requests to the Woolworths website
  const rateLimiter = new RateLimitQueue(10, 250)

  // Scrape the product details
  const productPromises = limitedProducts.map(async (productURL) => {

    // Since we may want to have state as part of the callbacks, we generate a stateful callback group for each product. 
    // If they don't provide a generator, we just use the callbacks as is.
    const productCallacks = callbacks?.generateProductCallbacks?.() || callbacks

    // Add the product to the rate limiter. This also calls it if it can
    const product = await rateLimiter.add(() => processProduct(productURL, productCallacks))

    // Call the callback for the product. This can be used for analytics, progress tracking, etc.
    return product
  })

  // Wait for all the products to be scraped
  const res = await Promise.all(productPromises)

  // Filter out any undefined products and return
  return res.filter((product) => product !== undefined)
}

export default scrapeWoolworths