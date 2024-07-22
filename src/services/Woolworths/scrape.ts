import type { Product, ScrapingCallbacks, ProductCallbacks, ScraperOptions } from '../../types'
import type { WoolworthsProduct } from './types';

import { sitemaps } from './Woolworths';

import extractFromSitemap from "./utils/extractFromSitemap";
import processProduct from './utils/processProduct';

import RateLimitQueue from '../../lib/rateLimiter';
import createCallbackHandler from '../../lib/callbackHandler';

const createProgressTracker = (total: number, callback?: (value: number) => void) => {
  let count = 0
  let lastCallProgress = 0
  return (...value: any[]) => {
    count++
    const progress = Math.floor((count / total) * 100)
    if (progress !== lastCallProgress) {
      lastCallProgress = progress
      callback?.(progress)
    }
  }
}

export const scrapeWoolworths = async (options: Partial<ScraperOptions>): Promise<Product[]> => {
  const callbackGroups = options.callbacks || []
  const limit = options.limit

  // group the callbacks so that we can call them all. 
  // Eg: [{ onProgress: onProgress1 }, { onProgress: onProgress2 }] => { onProgress: () => [onProgress1(), onProgress2()] }
  const callbacks = createCallbackHandler(callbackGroups)

  callbacks.onStart?.()

  // Scrape the Sitemap.xml
  const sitemapPromises = sitemaps.map(sitemap => extractFromSitemap(sitemap, callbacks))
  const productURLs = (await Promise.all(sitemapPromises)).flat()

  // Call the callback for the product URLs. This can be used for analytics, progress tracking, etc.
  callbacks.onEndpoints?.(productURLs)
  
  // Limit the number of products to scrape
  const limitedProducts = productURLs.slice(0, limit)

  // Create a rate limiter to limit the number of requests to the Woolworths website
  const rateLimiter = new RateLimitQueue(20, 50)

  // Create a tracker for the progress
  const trackProgress = createProgressTracker(limitedProducts.length, callbacks.onProgress)

  // Scrape the product details
  const productPromises = limitedProducts.map(async (productURL) => {

    // Since we may want to have state as part of the callbacks, we generate a stateful callback group for each product. 
    // If they don't provide a generator, we just use the callbacks as is.
    const productCallbackGroups = callbackGroups.map(callbacks => callbacks.generateProductCallbacks?.() || callbacks)
    const productCallbacks = createCallbackHandler(productCallbackGroups)

    // Add the product to the rate limiter. This also calls it if it can
    const product = await rateLimiter.add(() => processProduct(productURL, productCallbacks))

    // Call the callback for onProduct. This one is used to track progress.
    trackProgress(product)

    // Call the callback for the product. This can be used for analytics, progress tracking, etc.
    return product
  })

  // Wait for all the products to be scraped
  const res = await Promise.all(productPromises)

  // Filter out any undefined products and return
  const filtered = res.filter((product) => product !== undefined)

  // Call the callback for the finish. This can be used for analytics, progress tracking, etc.
  callbacks.onFinish?.(filtered)

  return filtered as Product[]
}

export default scrapeWoolworths