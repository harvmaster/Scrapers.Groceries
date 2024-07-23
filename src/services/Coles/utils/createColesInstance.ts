import type { ScrapingCallbacks } from '../../../types';
import type { Browser, BrowserContext, Page } from 'playwright';

import playwrightExtra from 'playwright-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';

import { loadCookies, saveCookies } from './persistentCookies';

export class Coles {
  private pages: Page[] = []

  constructor (private browser: Browser, private context: BrowserContext, public page: Page, private callbacks?: Partial<ScrapingCallbacks>) {}

  public static async prepareContext (browser: Browser) {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

    const context = await browser.newContext({
      acceptDownloads: true,
      extraHTTPHeaders: {
        'User-Agent': userAgent,
      },
      javaScriptEnabled: true,
    })

    return context
  }

  // Create a new page with cookies and user agent
  public static preparePage = async (browser: BrowserContext) => {
    // const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
    
    // const page = await browser.newPage({
    //   acceptDownloads: true,
    //   extraHTTPHeaders: {
    //     'User-Agent': userAgent,
    //   },
    //   javaScriptEnabled: true,
    // })

    const page = await browser.newPage()

    // Get old cookies and add them to the page
    const oldCookies = loadCookies()
    await page.context().addCookies(oldCookies)
    await page.setViewportSize({ width: 1920, height: 1080 })

    return page
  }

  // Create a new page and add it to the pages array
  private async createPage () {
    const page = await Coles.preparePage(this.context)

    this.pages.push(page)
    return page
  }

  private async closePage (page: Page) {
    await page.close()
    this.pages = this.pages.filter(p => p !== page)
  }

  // Close all the pages and the browser
  public async close () {
    await Promise.all(this.pages.map(page => page.close()))
    await this.browser.close()
  }

  // Fetch a URL using a new page
  public async fetch (url: string) {
    const page = await this.createPage()

    const colesPage = new ColesPage(page, this.callbacks)

    const res = await colesPage.fetch(url)

    await this.closePage(page)

    return res
  }

}

class ColesPage {
  constructor (private page: Page, private callbacks?: Partial<ScrapingCallbacks>) {}

  // Go to a URL
  private async goto (url: string, isRetry = false): Promise<void> {
    try {
      await this.page.goto(url)
    } catch (err) {
      this.callbacks?.onFetchError?.(err as Error, { url, retry: isRetry })
    
      if (isRetry) throw err

      return await this.goto(url, true)
    }
  }

  public async fetch (url: string, isRetry = false): Promise<unknown> {
    // Call the beforeFetch callback
    this.callbacks?.beforeFetch?.(url)

    try {
      // Go to the URL
      await this.goto(url)
  
      // Check if the page is rate limited. Send an error if it is
      await this.handleRateLimit()
  
      // Parse the page
      const res = await this.parsePage(isRetry)

      // Run the onFetchSuccess callback
      this.callbacks?.onFetchSuccess?.(res)

      return res
    } catch (err) {
      // Retry is handled internally, so if we fail up here, just return an empty object.
      // It'll be logged that the page failed, so best we can do is fail gracefully
      return {}
    }
  }

  // if the page is rate limited, throw an error
  private async handleRateLimit () {
    const content = await this.page.content()

    if (content.includes('<title>Pardon Our Interruption</title>')) {
      const url = this.page.url()

      const error = new Error(`Rate limited fetching ${url}`)
      this.callbacks?.onFetchError?.(error, { url })

      throw error
    }
  }

  // Parse the page into a json object
  private async parsePage (isRetry: boolean): Promise<unknown> {
    const rawContent = await this.page.content()

    // Remove HTML tags
    const content = rawContent.replace(/<[^>]*>?/gm, '')

    // Try to parse the content into a JSON object
    try {
      const json = JSON.parse(content)

      this.callbacks?.onFetchSuccess?.(json)

      return json
    } catch (err) {
      // Call the onFetchError callback
      const url = this.page.url()
      this.callbacks?.onFetchError?.(err as Error, { url, rawContent, content, retry: isRetry })
      
      // If its the first time, retry the fetch
      if (!isRetry) {
        return this.fetch(url, true)
      }
      
      // If its a retry, return an empty object. Fail gracefully
      return {}
    }
  }
}

const createColesInstance = async (callbacks?: Partial<ScrapingCallbacks>) => {
  // Use playwright-extra to launch the browser with puppeteer stealth
  playwrightExtra.chromium.use(puppeteerStealth())
  const browser = await playwrightExtra.chromium.launch({
    headless: true,
  })

  const context = await Coles.prepareContext(browser)

  // Create a new page and go to the Coles website
  const page = await Coles.preparePage(context)

  // Go to the Coles website, if it fails, close the page and throw an error
  try {
    await page.goto(`https://www.coles.com.au/browse/deli`)
  } catch (err) {
    console.error(err)

    // Close the page and throw an error
    await page.close()
    throw new Error('Failed to load Coles website')
  }

  // Save the cookies to the persistent storage
  const cookies = await page.context().cookies()
  saveCookies(cookies)

  // Create a new instance of the Coles class
  const instance = new Coles(browser, context, page, callbacks)

  // Return the instance
  return instance
}

export default createColesInstance