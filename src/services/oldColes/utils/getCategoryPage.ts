import type { Category, CategoryResponse, SentryVersionString } from "../types";
import createCategoryDataURL from "./createCategoryDataURL";

import FetchInstance from './fetchInstance'

export const getCategoryPage = async (sentryVerison: SentryVersionString, category: Category, page: number): Promise<CategoryResponse> => {
  const url = createCategoryDataURL(category, page, sentryVerison)

  const response = await FetchInstance.fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'en-AU,en;q=0.5',
      'Referer': 'https://www.google.com/',
      'Upgrade-Insecure-Requests': '0',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
    },
  })

  if (!response.ok) {
    console.log(response)
    throw new Error(`Failed to fetch category page: ${category}`)
  }

  const data = await response.json() as CategoryResponse

  return data
}

export default getCategoryPage