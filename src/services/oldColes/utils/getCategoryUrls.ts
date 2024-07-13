import type { CategoryUrl, CategoryMapUrl } from "../types";
import { CATEGORIES_SITEMAP } from "../Coles";

import FetchInstance from './fetchInstance'

import { load } from 'cheerio'

const fetchWithoutSSLVerification = (url: string, options?: RequestInit) => {
  return FetchInstance.fetch(url, { ...options, tls: { rejectUnauthorized: false } });
};

export const getCategoryUrls = async (sitemap: CategoryMapUrl): Promise<CategoryUrl[]> => {
  const response = await fetchWithoutSSLVerification(sitemap, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'en-AU,en;q=0.5',
      'Referer': 'https://www.google.com/',
      'Upgrade-Insecure-Requests': '0',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
    }
  })

  if (!response.ok) {
    console.log(response)
    throw new Error(`Failed to fetch category sitemap: ${CATEGORIES_SITEMAP}`)
  }

  const text = await response.text()
  console.log(text)

  const scriptElementRegex = /scriptElement\.src\s*=\s*"([^"]+)"/
  const scriptElementMatch = text.match(scriptElementRegex);

  console.log('scriptElementMatch')
  console.log(scriptElementMatch?.[1])

  const script = await FetchInstance.fetch(`https://www.coles.com.au${scriptElementMatch?.[1] as string}`)
  const scriptText = await script.text()
  console.log(scriptText)

  const $ = load(text)
  const categoryUrls = $('loc').map((i, element) => $(element).text()).get().filter((url: string | string[]) => {
    return url.includes('browse')
  }) as CategoryUrl[]

  return categoryUrls
}

export default getCategoryUrls