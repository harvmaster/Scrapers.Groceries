import type { SitemapURL, ShopProductURL } from "./types";
import { load } from 'cheerio'

export const extractFromSitemap = async (sitemap: SitemapURL): Promise<ShopProductURL[]> => {
  const response = await fetch(sitemap)
  const text = await response.text()

  const $ = load(text)

  const productURLs = $('loc').map((i: number, element: Element) => $(element).text()).get().filter((url: string | string[]) => {
    return url.includes('productdetails')
  }) as ShopProductURL[]

  return productURLs
}

export default extractFromSitemap