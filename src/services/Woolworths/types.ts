import { base_url, details_url } from './Woolworths'


export type BaseURL = typeof base_url

export type SitemapURL = `${BaseURL}/${string}.xml`

export type StockCode = `${number}`

export type ShopBaseURL = `${BaseURL}/shop/productdetails`
export type ShopProductURL = `${BaseURL}/shop/productdetails/${StockCode}/${string}`

export type DetailsURL = typeof details_url
export type ProductDetailsBaseURL = `${BaseURL}/${DetailsURL}`
export type ProductDetailsURL = `${BaseURL}/${DetailsURL}/${StockCode}`