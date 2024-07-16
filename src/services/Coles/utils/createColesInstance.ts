import playwright from 'playwright';
import playwrightExtra from 'playwright-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';
import { loadCookies, saveCookies } from './persistentCookies';
import type { Browser, Page } from 'playwright';
import type { ScrapingCallbacks } from '../../types';

// export const createPreparedPage = async (browser: Browser) => {
//   const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
  
//   const page = await browser.newPage({
//     acceptDownloads: true,
//     extraHTTPHeaders: {
//       'User-Agent': userAgent,
//     },
//     javaScriptEnabled: true,
//   })

//   // Get old cookies and add them to the page
//   const oldCookies = loadCookies()
//   await page.context().addCookies(oldCookies)
//   await page.setViewportSize({ width: 1920, height: 1080 })

//   return page
// }

// export const createColesInterface = async () => {
//   // Use playwright-extra to launch the browser with puppeteer stealth
//   playwrightExtra.chromium.use(puppeteerStealth())
//   const browser = await playwrightExtra.chromium.launch({
//     headless: true,
//   })

//   const basePage = await createPreparedPage(browser)
  
//   // Go to the Coles website
//   await basePage.goto(`https://www.coles.com.au/browse/deli`)
//   console.log('navigated to Coles')

//   // Save the cookies to the persistent storage
//   const cookies = await basePage.context().cookies()
//   saveCookies(cookies)

//   const close = async () => {
//     await basePage.close()
//     await browser.close()
//   }

//   return {
//     fetch: useFetch(basePage),
//     page: usePage(basePage),
//     createPage: createPreparedPage,
//     close
//   }
// }

// export const useFetch = (page: Page, callbacks?: ScrapingCallbacks) => {
//   const useFetchPage = async (url: string, isRetry = false) => {
//     // Get the browser from the page and make sure its not null
//     const browser = getBrowser(page)

//     // Call the beforeFetch callback
//     callbacks?.beforeFetch?.(url)

//     // Create a new page with cookies
//     const fetchPage = await createPreparedPage(browser)

//     // Go to the URL
//     try {
//       await fetchPage.goto(url)
//     } catch (err) {
//       // Catch any errors and call the onFetchError callback. Then retry the fetch
//       callbacks?.onFetchError?.(err as Error, { url, retry: isRetry })
    
//       await fetchPage.close()

//       return useFetchPage(url, true)
//     }

//     // Check if the page is rate limited. Send an error if it is
//     if (await isRateLimited(fetchPage)) {
//       const error = new Error(`Rate limited fetching ${url}`)
//       callbacks?.onFetchError?.(error, { url })

//       throw error
//     }

//     // Get HTML content of the page
//     const content = await fetchPage.content()

//     let json
//     const jsonText = content.replace(/<[^>]*>?/gm, '')
//     try {
//       // Remove HTML and get JSON data
//       json = JSON.parse(jsonText)
//     } catch (err) {
//       // Call the onFetchError callback
//       callbacks?.onFetchError?.(err as Error, { url, content, jsonText, retry: isRetry })

//       await fetchPage.close()

//       // If its a retry, return an empty object
//       if (isRetry) return {}

//       // Retry the fetch
//       return useFetchPage(url, true)
//     }
    
//     // Close the page
//     await fetchPage.close()

//     // Call the onFetchSuccess callback
//     callbacks?.onFetchSuccess(json)

//     return json
//   }

//   return useFetchPage
// }

// export const usePage = (page: Page) => {
//   return page
// }

// const isRateLimited = async (page: Page) => {
//   const content = await page.content()
//   if (content.includes('<title>Pardon Our Interruption</title>')) {
//     return true
//   }
  
//   return false
// }

// const getBrowser = (page: Page) => {
//   const browser = page.context().browser()
//   if (!browser) {
//     throw new Error('Browser is not available')
//   }

//   return browser
// }

// export default createColesInterface

class Coles {
  private pages: Page[] = []

  constructor (private browser: Browser, public page: Page, private callbacks?: Partial<ScrapingCallbacks>) {}

  // Create a new page with cookies and user agent
  public static preparePage = async (browser: Browser) => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
    
    const page = await browser.newPage({
      acceptDownloads: true,
      extraHTTPHeaders: {
        'User-Agent': userAgent,
      },
      javaScriptEnabled: true,
    })

    // Get old cookies and add them to the page
    const oldCookies = loadCookies()
    await page.context().addCookies(oldCookies)
    await page.setViewportSize({ width: 1920, height: 1080 })

    return page
  }

  // Create a new page and add it to the pages array
  private async createPage () {
    const page = await Coles.preparePage(this.browser)

    this.pages.push(page)
    return page
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
    return colesPage.fetch(url)
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
    
      if (isRetry) return

      return this.goto(url, true)
    }
  }


  public async fetch (url: string, isRetry = false): Promise<unknown> {
    // Call the beforeFetch callback
    this.callbacks?.beforeFetch?.(url)

    // Go to the URL
    await this.goto(url)

    // Check if the page is rate limited. Send an error if it is
    await this.handleRateLimit()

    // Parse the page
    return this.parsePage(isRetry)
  }
    

  // Check if the page is rate limited
  private async isRateLimited () {
    const content = await this.page.content()
    if (content.includes('<title>Pardon Our Interruption</title>')) {
      return true
    }
    
    return false
  }

  // if the page is rate limited, throw an error
  private async handleRateLimit () {
    if (await this.isRateLimited()) {
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
      
      // If its a retry, return an empty object
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

  // Create a new page and go to the Coles website
  const page = await Coles.preparePage(browser)
  await page.goto(`https://www.coles.com.au/browse/deli`)

  // Save the cookies to the persistent storage
  const cookies = await page.context().cookies()
  saveCookies(cookies)

  // Create a new instance of the Coles class
  const instance = new Coles(browser, page, callbacks)

  // Return the instance
  return instance
}

export default createColesInstance