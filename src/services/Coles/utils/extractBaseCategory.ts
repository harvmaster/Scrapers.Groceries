import type { Category, CategoryBaseURL } from "../types";
import extractCategory from "./extractCategory";

type CategoryURL<T extends Category> = `${CategoryBaseURL}/${T}/${string}`

export const extractBaseCategory = <T extends Category>(url: CategoryURL<T>): `${CategoryBaseURL}/${T}` => {
  const category = extractCategory(url)
  return `https://www.coles.com.au/browse/${category}`
};

export default extractBaseCategory;
