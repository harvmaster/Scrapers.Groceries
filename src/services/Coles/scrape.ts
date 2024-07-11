import { CATEGORIES_SITEMAP } from "./Coles"
import extractBaseCategory from "./utils/extractBaseCategory"
import getCategoryUrls from "./utils/getCategoryUrls"
import scrapeCategory from "./utils/scrapeCategory"

const dedupe = <T>(arr: T[]) => Array.from(new Set(arr))


export const scrapeColes = async ( ) => {
  const allCategories = await getCategoryUrls(CATEGORIES_SITEMAP)
  console.log(allCategories.length)
  
  const categories = dedupe(allCategories.map((extractBaseCategory))).slice(0, 1)
  console.log(categories)


  const products = (await Promise.all(categories.map(scrapeCategory))).flat()

  console.log(products.length)
  return products
}

export default scrapeColes