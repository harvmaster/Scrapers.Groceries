import type { CategoryUrl, CategoryMapUrl } from "../types";
import { CATEGORIES_SITEMAP } from "../Coles";

import fetchCookie from "fetch-cookie";

import { load } from 'cheerio'

const cookieFetch = fetchCookie(fetch);

const fetchWithoutSSLVerification = (url: string, options?: RequestInit) => {
  return cookieFetch(url, { ...options, tls: { rejectUnauthorized: false } });
};

export const getCategoryUrls = async (sitemap: CategoryMapUrl): Promise<CategoryUrl[]> => {
  const response = await fetchWithoutSSLVerification(sitemap, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.google.com/',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    }
  })

  if (!response.ok) {
    console.log(response)
    throw new Error(`Failed to fetch category sitemap: ${CATEGORIES_SITEMAP}`)
  }

  const text = await response.text()
  console.log(text)

  const $ = load(text)
  const categoryUrls = $('loc').map((i, element) => $(element).text()).get().filter((url: string | string[]) => {
    return url.includes('browse')
  }) as CategoryUrl[]

  return categoryUrls
}

export default getCategoryUrls