import type { CategoryMapUrl } from "./types";

export const CATEGORIES_SITEMAP: CategoryMapUrl = 'https://www.coles.com.au/sitemap/sitemap-categories.xml' as const

export const CATEGORIES_BLACKLIST = [
  'back-to-school',
  'coles-financial-services',
  'coles-insurance',
  'bonus-flybuys-points',
  'bonus-ovenware-credits',
  'down-down'
]

export const API_TEMPLATE = 'https://www.coles.com.au/_next/data/{{version}}/en/browse/{{category}}.json?page={{page}}' as const
