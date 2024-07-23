import extractCategoriesSitemap from "./extractCategoriesSitemap";
import extractCategoryURL from "./extractCategoryURL";
import extractCategory from "./extractCategory";

const dedupe = <T>(arr: T[]) => Array.from(new Set(arr))

export const getCategories = (blacklist?: string[]) => {
  const rawcCategories = extractCategoriesSitemap()
  
  const categoryURLs = rawcCategories.map(extractCategoryURL)
  
  const dedupedCategories = dedupe(categoryURLs)
  
  const categories = dedupedCategories.map(extractCategory)

  if (blacklist) {
    return categories.filter(category => !blacklist.includes(category))
  }
  
  return categories
}

export default getCategories