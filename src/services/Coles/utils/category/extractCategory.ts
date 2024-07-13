import type { Category, BrowseURL } from "../../types";

type CategoryURL<T extends Category> = `${BrowseURL}/${T}/${string}` | `${BrowseURL}/${T}`

export const extractCategory = <T extends Category>(url: CategoryURL<T>): T => {
  const category = url.split('/')[4]
  return category as T
}

export default extractCategory