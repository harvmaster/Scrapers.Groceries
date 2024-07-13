import { CATEGORIES_SITEMAP } from "./Coles"

import createColesInterface from "./utils/createColesInstance"

import extractCategory from "./utils/categories/extractCategory"
import extractCategoryURL from "./utils/categories/extractCategoryURL"

import getSentryVersion from "./utils/sentry/getSentryVersion"
import createCategoryScraper from "./utils/categories/createCategoryScraper"
import extractCategoriesSitemap from "./utils/categories/extractCategoriesSitemap"

const dedupe = <T>(arr: T[]) => Array.from(new Set(arr))

export const scrapeColes = async () => {
  const coles = await createColesInterface()
  
  try {
    const sentryVersion = await getSentryVersion(coles.page);

    const categoryScraper = createCategoryScraper(coles.fetch, sentryVersion)
  
    const rawcCategories = await extractCategoriesSitemap()
    console.log(rawcCategories.length)
  
    const categoryURLs = rawcCategories.map(extractCategoryURL)
    console.log(categoryURLs.length)
  
    const dedupedCategories = dedupe(categoryURLs).slice(0, 1)
    console.log(dedupedCategories)
  
    const categoryFns = await Promise.all(dedupedCategories.map(async (categoryURL) => {
      const category = extractCategory(categoryURL)
      return categoryScraper(category)
    }))
  
    const allFns = categoryFns.flat()
  
    const results = await Promise.all(allFns.map(async (fn) => {
      return fn()
    }))
  
    console.log(results)
  
    return results
  } catch (err) {
    console.error(err)
    await coles.close()
  }
}

export default scrapeColes