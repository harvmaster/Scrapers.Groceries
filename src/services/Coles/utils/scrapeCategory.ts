import createCategoryScraper from "./createCategoryScraper";

import type { BaseCategory } from "../types";

export const scrapeCategory = async (category: BaseCategory) => {
  const scraper = await createCategoryScraper(category)

  const initial = await scraper(1)

  if (!initial) {
    throw new Error('Failed to scrape category')
  }

  const totalProducts = initial.pageProps.searchResults.noOfResults
  const pageSize = initial.pageProps.searchResults.pageSize

  const totalPages = Math.ceil(totalProducts / pageSize)

  const promises = new Array(totalPages).fill(null).map((_, i) => scraper(i + 1))

  const pages = await Promise.all(promises)

  const products = pages.flatMap(page => page.pageProps.searchResults.results)

  return products
}

export default scrapeCategory