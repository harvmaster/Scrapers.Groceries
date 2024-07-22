import type { Scraper, Product, ScraperOptions } from '../../types'

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

  const rateLimiter = new RateLimitQueue(5, 250)
  
  const coles = await createColesInterface(callbacks)
  try {

    const sentryVersion = await getSentryVersion(coles.page);

    const categoryScraper = createCategoryScraper(coles, sentryVersion, options?.callbacks)
  
    const categories = getCategories()
    const limitedCategories = categories.slice(0, options?.limit)

    const categoryFns = await Promise.all(limitedCategories.map(async (category) => {
      const { categoryPageScrapers, endpoints } = await rateLimiter.add(() => categoryScraper(category))
      return { categoryPageScrapers, endpoints }
    }))

    const endpoints = categoryFns.map(({ endpoints }) => endpoints).flat()
    callbacks.onEndpoints?.(endpoints)

    const categoryFnsFlat = categoryFns.map(({ categoryPageScrapers }) => categoryPageScrapers)
    const allFns = categoryFnsFlat.flat()
    
    const trackProgress = useProgressTracker(allFns.length, callbacks.onProgress)
  
    const results = await Promise.all(allFns.map(async (fn) => {
      const res = await rateLimiter.add(fn)
      trackProgress()
      return res
    })).then((results) => results.flat())

    callbacks.onFinish?.(results)
  
    return results
  } catch (err) {
    console.error(err)
    
    callbacks.onError?.(err as Error)
    callbacks.onFinish?.([])

    await coles.close()
    return []
  }
}

export default scrapeColes