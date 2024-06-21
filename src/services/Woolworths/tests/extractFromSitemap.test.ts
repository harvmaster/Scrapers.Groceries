import { test, describe, expect } from 'bun:test'

import { extractFromSitemap } from '../extractFromSitemap';
import { sitemaps } from '../Woolworths';

describe('Woolworths extractFromSitemap', () => {
  test('Extracts from Woolworths sitemap', async () => {
    const sitemap = sitemaps[0]
    const productURLs = await extractFromSitemap(sitemap)
    expect(productURLs).toBeTruthy()
    expect(productURLs.length).toBeGreaterThan(0)
  })
})