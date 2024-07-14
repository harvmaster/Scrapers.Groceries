import playwright from 'playwright';
import playwrightExtra from 'playwright-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';
import { loadCookies, saveCookies } from './persistentCookies';
import type { Browser, Page } from 'playwright';
import type { ScrapingCallbacks } from '../../types';

export const createPreparedPage = async (browser: Browser) => {
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

export const createColesInterface = async () => {
  // Use playwright-extra to launch the browser with puppeteer stealth
  playwrightExtra.chromium.use(puppeteerStealth())
  const browser = await playwrightExtra.chromium.launch({
    headless: true,
  })

  const basePage = await createPreparedPage(browser)
  
  // Go to the Coles website
  await basePage.goto(`https://www.coles.com.au/browse/deli`)
  console.log('navigated to Coles')

  // Save the cookies to the persistent storage
  const cookies = await basePage.context().cookies()
  saveCookies(cookies)

  const close = async () => {
    await basePage.close()
    await browser.close()
  }

  return {
    fetch: useFetch(basePage),
    page: usePage(basePage),
    createPage: createPreparedPage,
    close
  }
}

export const useFetch = (page: Page, callbacks?: ScrapingCallbacks) => {
  const fetchPage = async (url: string) => {
    // Get the browser from the page and make sure its not null
    const browser = page.context().browser()
    if (!browser) {
      throw new Error('Browser is not available')
    }

    // Call the beforeFetch callback
    callbacks?.beforeFetch?.(url)

    // Create a new page with cookies
    const fetchPage = await createPreparedPage(browser)

    // Go to the URL
    await fetchPage.goto(url)

    // Check if the page is rate limited. Send an error if it is
    if (await isRateLimited(fetchPage)) {
      const error = new Error(`Rate limited fetching ${url}`)
      callbacks?.onFetchError?.(error)
      throw error
    }

    // Get HTML content of the page
    const content = await fetchPage.content()

    // Remove HTML and get JSON data
    const json = JSON.parse(content.replace(/<[^>]*>?/gm, ''))

    // Close the page
    await page.close()

    // Call the onFetchSuccess callback
    callbacks?.onFetchSuccess(json)

    return json
  }

  return fetchPage
}

export const usePage = (page: Page) => {
  return page
}

const isRateLimited = async (page: Page) => {
  const content = await page.content()
  if (content.includes('<title>Pardon Our Interruption</title>')) {
    return true
  }
  
  return false
}

export default createColesInterface