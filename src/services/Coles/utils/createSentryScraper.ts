import type { Page } from 'playwright';
import type { Category, CategoryResponse } from '../types';

import getSentryVersion from './sentry/getSentryVersion';
import createSentryCategoryURL from './createSentryCategoryURL';

export const createSentryScraper = async (fetch: (url: string) => Promise<unknown>) => {
  const sentryVersion = await getSentryVersion(fetch, 'https://www.coles.com.au/browse/deli');

  return async (category: Category) => {
    // Get the first page of the category to get the total number of pages needed
    const url = createSentryCategoryURL(category, 1, sentryVersion);
    const page = await fetch(url); // json

    // Get the total number of pages
    const content = await page.content()

    try {
      // console.log(content)
      const data = JSON.parse(content) as CategoryResponse

      // Calculate the total number of pages
      const totalResults = data.pageProps.searchResults.noOfResults
      const pageSize = data.pageProps.searchResults.pageSize

      const totalPages = Math.ceil(totalResults / pageSize)

      // Create fns for each page
      const fns = Array.from({ length: totalPages }, (_, i) => {
        return async () => {
          const url = createSentryCategoryURL(category, i + 1, sentryVersion);
          const page = await fetch(url); // json

          const content = await page.content()

          try {
            return JSON.parse(content) as CategoryResponse
          } catch (err) {
            throw new Error('Failed to parse JSON content')
          }
        }
      })

      return fns
    } catch (err) {
      console.log(url, content)
      throw new Error('Failed to parse JSON content')
    }
  }
}