import extractCategoriesSitemap from "./extractCategoriesSitemap";
import extractCategoryURL from "./extractCategoryURL";
import extractCategory from "./extractCategory";

const dedupe = <T>(arr: T[]) => Array.from(new Set(arr))

export const getCategories = () => {
  const rawcCategories = extractCategoriesSitemap()
  
  const categoryURLs = rawcCategories.map(extractCategoryURL)
  
  const dedupedCategories = dedupe(categoryURLs)
  
  const categories = dedupedCategories.map(extractCategory)
  
  return categories
}

export default getCategories