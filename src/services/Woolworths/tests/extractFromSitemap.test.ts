import { test, describe, expect, mock } from 'bun:test'

import { extractFromSitemap } from '../utils/extractFromSitemap';
import { sitemaps } from '../Woolworths';

describe('Woolworths extractFromSitemap', () => {
  test('Extracts from Woolworths sitemap', async () => {
    const sitemap = sitemaps[0]
    const productURLs = await extractFromSitemap(sitemap)
    expect(productURLs).toBeTruthy()
    expect(productURLs.length).toBeGreaterThan(0)
  })

  test('Calls callback for Sitemap', async () => {
    const sitemap = sitemaps[0]

    let onSiteMapCalled = false
    const onSitemap = mock((data: string) => {
      onSiteMapCalled = true
    })

    await extractFromSitemap(sitemap, {
      onSitemap 
    })

    expect(onSitemap).toHaveBeenCalled()
    expect(onSiteMapCalled).toBe(true)
  })
})