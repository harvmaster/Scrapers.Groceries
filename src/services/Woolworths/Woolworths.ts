import type { SitemapURL } from "./types"

export const base_url = 'https://www.woolworths.com.au' as const
export const details_url = 'apis/ui/product/detail' as const

export const sitemaps: SitemapURL[] = [
  'https://www.woolworths.com.au/sitemap1.xml',
  'https://www.woolworths.com.au/sitemap2.xml',
] as const

