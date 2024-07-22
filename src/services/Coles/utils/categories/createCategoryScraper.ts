import type { ScrapingCallbacks } from "../../../../types";
import type { Category, CategoryResponse, ColesProduct, SentryVersionString } from "../../types";
import { Coles } from '../createColesInstance'

import createCallbackHandler from "../../../../lib/callbackHandler";

import createSentryCategoryURL from "../sentry/createSentryCategoryURL";

import processProduct from "../products/processProduct";

export const createCategoryScraper = (browser: Coles, sentry: SentryVersionString, callbackGroups?: Partial<ScrapingCallbacks>[]) => {
  return async (category: Category) => {

    // Get the first page of the category to get the total number of pages needed
    const url = createSentryCategoryURL(category, 1, sentry);
    const data = await browser.fetch(url) as CategoryResponse;

    const totalResults = data.pageProps.searchResults.noOfResults
    const pageSize = data.pageProps.searchResults.pageSize

    const totalPages = Math.ceil(totalResults / pageSize)

    const endpoints: string[] = []

    // Create fns for each page
    const fns = Array.from({ length: totalPages }, (_, i) => {
      return async () => {
        const productCallbackGroups = callbackGroups?.map(callbacks => callbacks.generateProductCallbacks?.() || callbacks)
        const productCallbacks = createCallbackHandler(productCallbackGroups || [])

        const url = createSentryCategoryURL(category, i + 1, sentry);
        endpoints.push(url)

        productCallbacks?.beforeProductRequest?.(url)

        const data = await browser.fetch(url) as CategoryResponse;

        const productPromises = data?.pageProps?.searchResults?.results.map((product: ColesProduct) => {
          return processProduct(product, productCallbacks)
        }) || []

        const products = await Promise.all(productPromises)

        return products.filter(product => product != undefined)
      }
    })

    return { categoryPageScrapers: fns, endpoints }
  }
}

export default createCategoryScraper