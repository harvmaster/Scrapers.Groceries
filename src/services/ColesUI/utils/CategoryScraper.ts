import playwright from 'playwright';
import type { Browser, Page, BrowserContext } from 'playwright';
import playwrightExtra from 'playwright-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';

import type { Product, ScraperOptions, ScrapingCallbacks } from '../../../types';

import RateLimiter from '../../../lib/rateLimiter';
import type { ColesProduct } from '../types';
import processProduct from './products/processProduct';
import createCallbackHandler from '../../../lib/callbackHandler';

const COLES_URL = 'https://www.coles.com.au/browse'
const SPEED_LIMIT = 20

class ColesScraper {

  name: string = 'Coles'

  #rateLimit: RateLimiter
  #rawCallbacks: Partial<ScrapingCallbacks>[] = []
  #callbacks: Partial<ScrapingCallbacks> = {}

  constructor (options?: Partial<ScraperOptions>) {
    if (options?.callbacks) {
      this.#rawCallbacks = options.callbacks
      this.#callbacks = createCallbackHandler(options.callbacks)
    }

    this.#rateLimit = new RateLimiter(5, 500)
  }

  async scrapeAllCategories (): Promise<Product[]> {
    this.#callbacks.onStart?.()

    // Use playwright-extra to launch the browser with puppeteer stealth
    playwrightExtra.chromium.use(puppeteerStealth())
    const browser = await playwrightExtra.chromium.launch({
      headless: true,
    })

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

    const context = await browser.newContext({
      acceptDownloads: true,
      extraHTTPHeaders: {
        'User-Agent': userAgent,
      },
      javaScriptEnabled: true,
    })

    const page = await context.newPage()
    await page.goto(COLES_URL)

    console.log(await page.content())

    const categoryCardElements = await page.$$('[data-testid="category-card"]')
    const categoriesUnfiltered = await Promise.all(categoryCardElements.map(async (el) => {
      const href = await el?.getProperty('href')
      const url = await href?.jsonValue() as string
      const category = await el?.getProperty('textContent').then((txt ) => txt.jsonValue())
      return { name: category, url }
    }))

    const categories = categoriesUnfiltered.filter((category) => category.url !== null && category.name !== 'Specials')
    console.log(categories)

    const categoryPromises = categories.map(async (category) => {
      const products = await this.scrapeCategory(context, category.url)
      return products
    })

    const productsByCategory = await Promise.all(categoryPromises)
    const products = productsByCategory.flat()

    await browser.close()

    this.#callbacks.onFinish?.(products)

    return products
  }

  async scrapeCategory (browser: BrowserContext, category_url: string): Promise<Product[]> {
    try {
      const page = await browser.newPage()
      await page.goto(category_url)

      const paginationElement = await page.$('[data-testid="pagination"]')
      const ulElement = await paginationElement?.$('ul')
      
      // Calculate the number of pages
      const maxPages = await ulElement?.evaluate((el) => {
        const childCount = el.childElementCount
        const lastPage = el.children[childCount-2]
        const lastPageNum = lastPage?.textContent || '1'
        return parseInt(lastPageNum)
      })

      if (!maxPages) throw new Error('Failed to get max pages')

      // Create a list of page URLs
      const endpoints = []
      for (let i = 1; i <= maxPages; i++) {
        const pageURL = `${category_url}?page=${i}`
        endpoints.push(pageURL)
      }

      // Create rate limited requests
      const requests = endpoints.map((url) => {
        return this.#rateLimit.add(async () => {
          const products = await this.scrapeURL(browser, url)
          return products
        })
      })

      // Wait for all pages to be scraped, then flatten the array (Product[][] => Product[])
      const productByPage = await Promise.all(requests)
      const products = productByPage.flat()

      return products
    } catch (err) {
      this.#callbacks.onFetchError?.(err as Error, { url: category_url })
      return []
    }
  }

  async scrapeURL (browser: BrowserContext, url: string): Promise<Product[]> {
    const page = await browser.newPage()

    // Block images
    await page.route('**/*', route => {
      return route.request().resourceType() === 'image' ? route.abort() : route.continue();
    });

    // Go to URL
    await page.goto(url)

    // Scrape products
    let products: Product[] = []
    try {

      // Get data that is loaded in the browser
      const data: ColesProduct[] = await page.evaluate(() => {
        return eval('this.colDataState.b.data.shop.tiles')
      })

      // filter out ads
      const tiles = data.filter(tile => tile._type == 'PRODUCT')

      // Format ColesProduct into Product an get barcode
      const processedProducts = await Promise.all(
        tiles.map(async (product: ColesProduct) => {
          return await processProduct(product, this.#callbacks)
        })
      )

      // Remove undefined products
      products = processedProducts.filter((product) => product !== undefined) as Product[]
    } catch (err) {
      console.error(err)
      console.log(`${url} failed to scrape`)
      this.#callbacks.onFetchError?.(err as Error, { url, page: await page.content() })
    }

    return products
  }

}

export default ColesScraper