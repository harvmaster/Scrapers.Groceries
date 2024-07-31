import type { ScraperOptions, Product } from '../../types'
import CategoryScraper from './utils/CategoryScraper'

export const scrapeColes = async (options: Partial<ScraperOptions>): Promise<Product[]> => {
  const scraper = new CategoryScraper(options)

  return await scraper.scrapeAllCategories()
}

export default scrapeColes