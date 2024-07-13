import { CATEGORIES_SITEMAP } from "./Coles"
import extractCategory from "./utils/category/extractCategory"
import extractCategoryURL from "./utils/category/extractCategoryURL"
import createColesInterface from "./utils/createColesInterface"
import { createSentryScraper } from "./utils/createSentryScraper"
import extractCategoriesSitemap from "./utils/extractCategoriesSitemap"

const dedupe = <T>(arr: T[]) => Array.from(new Set(arr))

export const scrapeColes = async () => {
  const coles = await createColesInterface()
  
  try {
    const sentryScraper = await createSentryScraper(coles.fetch)
  
    const rawcCategories = await extractCategoriesSitemap()
    console.log(rawcCategories.length)
  
    const categoryURLs = rawcCategories.map(extractCategoryURL)
    console.log(categoryURLs.length)
  
    const dedupedCategories = dedupe(categoryURLs).slice(0, 1)
    console.log(dedupedCategories)
  
    const categoryFns = await Promise.all(dedupedCategories.map(async (categoryURL) => {
      const category = extractCategory(categoryURL)
      return sentryScraper(category)
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