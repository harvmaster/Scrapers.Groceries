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
  const useFetchPage = async (url: string, isRetry = false) => {
    // Get the browser from the page and make sure its not null
    const browser = getBrowser(page)

    // Call the beforeFetch callback
    callbacks?.beforeFetch?.(url)

    // Create a new page with cookies
    const fetchPage = await createPreparedPage(browser)

    // Go to the URL
    try {
      await fetchPage.goto(url)
    } catch (err) {
      // Catch any errors and call the onFetchError callback. Then retry the fetch
      callbacks?.onFetchError?.(err as Error, { url, retry: isRetry })
    
      await fetchPage.close()

      return useFetchPage(url, true)
    }

    // Check if the page is rate limited. Send an error if it is
    if (await isRateLimited(fetchPage)) {
      const error = new Error(`Rate limited fetching ${url}`)
      callbacks?.onFetchError?.(error, { url })

      throw error
    }

    // Get HTML content of the page
    const content = await fetchPage.content()

    let json
    const jsonText = content.replace(/<[^>]*>?/gm, '')
    try {
      // Remove HTML and get JSON data
      json = JSON.parse(jsonText)
    } catch (err) {
      // Call the onFetchError callback
      callbacks?.onFetchError?.(err as Error, { url, content, jsonText, retry: isRetry })

      await fetchPage.close()

      // If its a retry, return an empty object
      if (isRetry) return {}

      // Retry the fetch
      return useFetchPage(url, true)
    }
    
    // Close the page
    await fetchPage.close()

    // Call the onFetchSuccess callback
    callbacks?.onFetchSuccess(json)

    return json
  }

  return useFetchPage
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

const getBrowser = (page: Page) => {
  const browser = page.context().browser()
  if (!browser) {
    throw new Error('Browser is not available')
  }

  return browser
}

export default createColesInterface