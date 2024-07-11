import type { Category, CategoryBaseURL } from "../types";

type CategoryURL<T extends Category> = `${CategoryBaseURL}/${T}/${string}`

export const extractCategory = <T extends Category>(url: CategoryURL<T>): T => {
  const category = url.split('/')[4]
  return category as T
}

export default extractCategory