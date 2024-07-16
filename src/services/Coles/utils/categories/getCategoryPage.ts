import type { Category, CategoryResponse, SentryVersionString } from "../../types"
import createSentryCategoryURL from "../sentry/createSentryCategoryURL";


export const fetchCategoryPage = async (category: Category, page: number, sentry: SentryVersionString): Promise>Product[]> => {
  const url = createSentryCategoryURL(category, 1, sentry);
  const data = await fetch(url) as CategoryResponse;
}

export default fetchCategoryPage