import { base_url, details_url } from "./Woolworths";
import type { ProductDetailsBaseURL, StockCode } from "./types";

export const getDetailsURL = <T extends StockCode>(stockCode: T): `${ProductDetailsBaseURL}/${T}` => {
  return `${base_url}/${details_url}/${stockCode}`
}

export default getDetailsURL