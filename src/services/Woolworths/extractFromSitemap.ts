import { base_url } from "./Woolworths";
import type { SitemapURL, ShopProductURL, FetchOptions } from "./types";
import { load } from 'cheerio'
import FetchInstance from "./FetchInstance";

export const extractFromSitemap = async (sitemap: SitemapURL, options?: FetchOptions): Promise<ShopProductURL[]> => {
  const url = `${sitemap}`

  const response = await FetchInstance.fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'X-Originating-IP': '127.0.0.1'
    },
    redirect: 'follow',
    credentials: 'include'
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