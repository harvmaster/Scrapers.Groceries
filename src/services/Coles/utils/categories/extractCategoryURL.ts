import type { BrowseURL, Category } from "../../types";
import extractCategory from "./extractCategory";

type CategoryURL<T extends Category> = `${BrowseURL}/${T}/${string}`

export const extractCategoryURL = <T extends Category>(url: CategoryURL<T>): `${BrowseURL}/${T}` => {
  const category = extractCategory(url)
  return `https://www.coles.com.au/browse/${category}`
};

export default extractCategoryURL;
