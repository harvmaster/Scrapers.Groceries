import type { Category, CategoryResponse, SentryVersionString } from "../../types";
import createSentryCategoryURL from "../sentry/createSentryCategoryURL";

export const createCategoryScraper = (fetch: (url: string) => Promise<unknown>, sentry: SentryVersionString) => {
  return async (category: Category) => {
    // Get the first page of the category to get the total number of pages needed
    const url = createSentryCategoryURL(category, 1, sentry);
    const data = await fetch(url) as CategoryResponse;

    const totalResults = data.pageProps.searchResults.noOfResults
    const pageSize = data.pageProps.searchResults.pageSize

    const totalPages = Math.ceil(totalResults / pageSize)

    // Create fns for each page
    const fns = Array.from({ length: totalPages }, (_, i) => {
      return async () => {
        const url = createSentryCategoryURL(category, i + 1, sentry);
        const data = await fetch(url); // json

        return data as CategoryResponse
      }
    })

    return fns
  }
}

export default createCategoryScraper