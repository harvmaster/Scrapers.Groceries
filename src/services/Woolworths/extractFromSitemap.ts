import { base_url } from "./Woolworths";
import getCookies from "./getCookies";
import type { SitemapURL, ShopProductURL, FetchOptions } from "./types";
import { load } from 'cheerio'

export const extractFromSitemap = async (sitemap: SitemapURL, options?: FetchOptions): Promise<ShopProductURL[]> => {
  if (!options) options = {
    cookies: '',
    retry: true
  }
  if (options.cookies) console.log('Cookies:', options.cookies)

  const url = `${sitemap}`

  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'X-Originating-IP': '127.0.0.1',
      'cookie': options.cookies
    },
    redirect: 'follow',
    credentials: 'include'
  })

  if (!response.ok) {
    const resCookies = response.headers.get('set-cookie')
    if (resCookies) return extractFromSitemap(sitemap, { cookies: resCookies, retry: false })
    if (options.retry) return extractFromSitemap(sitemap, { cookies: await getCookies(`${base_url}/shop/browse`), retry: false })

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