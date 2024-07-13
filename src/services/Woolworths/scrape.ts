import type { WoolworthsProduct, ProductCallbacks, ScrapingCallbacks, Product } from './types';

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

export const scrapeWoolworths = async (limit?: number, ...callbackGroups: Partial<ScrapingCallbacks>[]): Promise<Product[]> => {
  // group the callbacks so that we can call them all. 
  // Eg: [{ onProgress: onProgress1 }, { onProgress: onProgress2 }] => { onProgress: () => [onProgress1(), onProgress2()] }
  const callbacks = createCallbackHandler(callbackGroups)

  callbacks.onStart?.()

  // Scrape the Sitemap.xml
  const sitemapPromises = sitemaps.map(sitemap => extractFromSitemap(sitemap, callbacks))
  const productURLs = (await Promise.all(sitemapPromises)).flat()

  // Call the callback for the product URLs. This can be used for analytics, progress tracking, etc.
  callbacks.onProductURLS?.(productURLs)
  
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


// type ArrayValue<T> = { [K in keyof T]: T[K][] }
// type GroupedScraperCallbacks = ArrayValue<ScrapingCallbacks>

// export class WoolworthsScraper {
//   private handlers: Required<GroupedScraperCallbacks>

//   constructor(private limit?: number) {
//     this.handlers = {
//       onStart: [],
//       onProgress: [],
//       onError: [],
//       onFinish: [],
//       onProductURLS: [],
//       beforeProduct: [],
//       onProductSuccess: [],
//       onProductError: [],
//       onSitemap: [],
//       onSitemapError: [],
//       generateProductCallbacks: []
//     }
//   }

//   addHandlers(handlers: ScrapingCallbacks) {
//     for (const key in handlers) {
//       if (Object.prototype.hasOwnProperty.call(handlers, key)) {
//         const handler = handlers[key as keyof ScrapingCallbacks];
//         if (handler) {
//           (this.handlers[key as keyof GroupedScraperCallbacks] as any[]).push(handler);
//         }
//       }
//     }
//   }

//   onStart(callback: ScrapingCallbacks['onStart']) {
//     this.handlers.onStart.push(callback)
//   }

//   onProgress(callback: ScrapingCallbacks['onProgress']) {
//     this.handlers.onProgress.push(callback)
//   }

//   onError(callback: ScrapingCallbacks['onError']) {
//     this.handlers.onError.push(callback)
//   }

//   onFinish(callback: ScrapingCallbacks['onFinish']) {
//     this.handlers.onFinish.push(callback)
//   }

//   onProductURLS(callback: ScrapingCallbacks['onProductURLS']) {
//     this.handlers.onProductURLS.push(callback)
//   }

//   beforeProduct(callback: ScrapingCallbacks['beforeProduct']) {
//     this.handlers.beforeProduct.push(callback)
//   }

//   onProductSuccess(callback: ScrapingCallbacks['onProductSuccess']) {
//     this.handlers.onProductSuccess.push(callback)
//   }

//   onProductError(callback: ScrapingCallbacks['onProductError']) {
//     this.handlers.onProductError.push(callback)
//   }

//   onSitemap(callback: ScrapingCallbacks['onSitemap']) {
//     this.handlers.onSitemap.push(callback)
//   }

//   onSitemapError(callback: ScrapingCallbacks['onSitemapError']) {
//     this.handlers.onSitemapError.push(callback)
//   }

//   addProductCallbackGenerator(callback: ScrapingCallbacks['generateProductCallbacks']) {
//     this.handlers.generateProductCallbacks.push(callback)
//   }

//   // generateProductCallbacks(callback: ScrapingCallbacks['generateProductCallbacks']) {
//   //   this.handlers.generateProductCallbacks.push(callback)
//   // }


//   private generateProductCallbacks(): ProductCallbacks {    
//     const generatedGroups = this.handlers.generateProductCallbacks.map(cb => cb())
//     const baseHandlers = {
//       onProductError: this.handlers.onProductError,
//       onProductSuccess: this.handlers.onProductSuccess,
//       beforeProduct: this.handlers.beforeProduct
//     }

//     const handlers = createCallbackHandler([ ...generatedGroups, ...baseHandlers ])

//     generatedGroups.forEach(cb => {
//       Object.entries(cb).forEach(([key, value]) => {
//         if (!handlers[key]) {
//           handlers[key] = []
//         }
  
//         handlers[key].push(value)
//       })
//     })

//     return {
//       onProductError: (error) => {
//         this.handlers.onProductError.forEach(cb => cb(error))
//       },
//       onProductSuccess: (product) => {
//         this.handlers.onProductSuccess.forEach(cb => cb(product))
//       },
//       beforeProduct: (url) => {
//         this.handlers.beforeProduct.forEach(cb => cb(url))
//       }
//     }
//   }
  


// }


