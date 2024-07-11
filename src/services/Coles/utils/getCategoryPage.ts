import type { BaseCategory, CategoryResponse, CategoryUrl, ColesProduct, SentryVersionString } from "../types";
import createCategoryDataURL from "./createCategoryDataURL";


export const getCategoryPage = async (sentryVerison: SentryVersionString, category: BaseCategory, page: number): Promise<CategoryResponse> => {
  const url = createCategoryDataURL(category, page, sentryVerison)

  const response = await fetch(url, {
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
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch category page: ${category}`)
  }

  const data = await response.json() as CategoryResponse

  return data
}

export default getCategoryPage