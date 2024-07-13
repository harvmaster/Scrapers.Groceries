import type { BaseCategory, CategoryUrl } from "../types";
import extractCategory from "./extractCategory";
import getCategoryPage from "./getCategoryPage";
import getSentryVersion from "./sentry/getSentryVersion";
import isValidSentryVersion from "./sentry/isValidSentryVersion";


export const createCategoryScraper = async (baseCategory: BaseCategory) => {
  const sentryVersion = await getSentryVersion(baseCategory)

  if (!isValidSentryVersion(sentryVersion)) {
    throw new Error(`Invalid Sentry version: ${sentryVersion}`)
  }

  console.log(`Using Sentry version: ${sentryVersion}`)

  const category = extractCategory(baseCategory)
  return async (page: number) => {
    return getCategoryPage(sentryVersion, category, page)
  }
}

export default createCategoryScraper