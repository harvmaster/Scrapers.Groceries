import type { SitemapURL, ShopProductURL } from "./types";
import { load } from 'cheerio'

export const extractFromSitemap = async (sitemap: SitemapURL): Promise<ShopProductURL[]> => {
  const response = await fetch(sitemap)
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${sitemap}`)
  }
  
  const text = await response.text()
  const $ = load(text)

  const productURLs = $('loc').map((i, element) => $(element).text()).get().filter((url: string | string[]) => {
    return url.includes('productdetails')
  }) as ShopProductURL[]

  return productURLs
}

export default extractFromSitemap