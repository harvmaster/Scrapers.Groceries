import type { Scraper, ScrapingCallbacks, Product, ScraperOptions } from '../types'

import createColesInterface from "./utils/createColesInstance"

import getSentryVersion from "./utils/sentry/getSentryVersion"

import getCategories from "./utils/categories/getCategories"
import createCategoryScraper from "./utils/categories/createCategoryScraper"

import useProgressTracker from "../../lib/useProgressTracker"
import createCallbackHandler from '../../lib/callbackHandler'
import RateLimitQueue from '../../lib/rateLimiter'


export const scrapeColes: Scraper = async (options?: Partial<ScraperOptions>): Promise<Product[]> => {
  const callbacks = createCallbackHandler(options?.callbacks || [])
  
  callbacks.onStart?.()

  const rateLimiter = new RateLimitQueue(5, 100)
  
  const coles = await createColesInterface()
  try {

    const sentryVersion = await getSentryVersion(coles.page);

    const categoryScraper = createCategoryScraper(coles.fetch, sentryVersion, options?.callbacks)
  
    const categories = getCategories()
    const limitedCategories = categories.slice(0, options?.limit)

    const categoryFns = await Promise.all(limitedCategories.map(async (category) => {
      const categoryPageScrapers = await rateLimiter.add(() => categoryScraper(category))
      return categoryPageScrapers
    }))

    const allFns = categoryFns.flat()
    
    const trackProgress = useProgressTracker(allFns.length, callbacks.onProgress)
  
    const results = await Promise.all(allFns.map(async (fn) => {
      const res = await rateLimiter.add(fn)
      trackProgress()
      return res
    })).then((results) => results.flat())
  
    console.log(results)

    callbacks.onFinish?.(results)
  
    return results
  } catch (err) {
    console.error(err)
    callbacks.onError?.(err as Error)
    await coles.close()
    return []
  }
}

export default scrapeColes