import playwright from 'playwright';
import playwrightExtra from 'playwright-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';
import { loadCookies, saveCookies } from './persistentCookies';
import type { Browser, Page } from 'playwright';

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
  console.log('created page')
  
  // Go to the Coles website
  await basePage.goto(`https://www.coles.com.au/browse/deli`)
  console.log('navigated to Coles')

  // Save the cookies to the persistent storage
  const cookies = await basePage.context().cookies()
  saveCookies(cookies)
  console.log(cookies)

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

export const useFetch = (page: Page) => {
  const fetchPage = async (url: string) => {
    const requestContext = page.request
    const response = await requestContext.get(url)
    console.log(response)

    const data = await response.json()

    return data
  }

  return fetchPage
}

export const usePage = (page: Page) => {
  return page
}

export default createColesInterface