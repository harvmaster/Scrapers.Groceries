import type { SitemapURL, ShopProductURL } from "./types";
import { load } from 'cheerio'

export const extractFromSitemap = async (sitemap: SitemapURL): Promise<ShopProductURL[]> => {
  const response = await fetch(sitemap, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
  })
  if (!response.ok) {
    console.log(response)
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