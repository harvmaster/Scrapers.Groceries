import type { BaseCategory, CategoryUrl } from "../types";
import getCategoryPage from "./getCategoryPage";
import getSentryVersion from "./sentry/getSentryVersion";
import isValidSentryVersion from "./sentry/isValidSentryVersion";


export const createCategoryScraper = async (category: BaseCategory) => {
  const sentryVersion = await getSentryVersion(category)

  if (!isValidSentryVersion(sentryVersion)) {
    throw new Error(`Invalid Sentry version: ${sentryVersion}`)
  }

  return async (page: number) => {
    return getCategoryPage(sentryVersion, category, page)
  }
}

export default createCategoryScraper