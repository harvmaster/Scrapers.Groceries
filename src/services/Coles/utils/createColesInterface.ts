import puppeteer from 'puppeteer';
import type { Page } from 'playwright';

import playwright from 'playwright';
import playwrightExtra from 'playwright-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';
import { loadCookies, saveCookies } from './persistentCookies';

export const createColesInterface = async () => {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
  const blockedContent = []

  playwrightExtra.chromium.use(puppeteerStealth())
  const browser = await playwrightExtra.chromium.launch({
    headless: true,
  })


  // const browser = await puppeteer.launch({
  //   headless: true,
  //   executablePath: '/usr/bin/chromium-browser',
  //   args: [
  //     '--no-sandbox',
  //     '--disable-setuid-sandbox'
  //   ]
  // })
  const oldCookies = loadCookies()

  const basePage = await browser.newPage({
    acceptDownloads: true,
    extraHTTPHeaders: {
      'User-Agent': userAgent,
    },
    javaScriptEnabled: true,
  })

  await basePage.context().addCookies(oldCookies)

  await basePage.setViewportSize({ width: 1920, height: 1080 })
  await basePage.goto(`https://www.coles.com.au/browse/deli`)

  const cookies = await basePage.context().cookies()
  console.log(cookies)
  saveCookies(cookies)

  const pages: Page[] = []

  const fetchPage = async (url: string) => {
    const page = await browser.newPage({
      acceptDownloads: true,
      extraHTTPHeaders: {
        'User-Agent': userAgent,
        'referrer': 'https://www.coles.com.au/browse',
      },

      javaScriptEnabled: true,
    })
    pages.push(page)

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.context().addCookies(cookies)

    // await page.(userAgent)
    // await page.setRequestInterception(true)

    // // Only allow relavents types of requests
    // page.on('request', (req) => {
    //   if (blockedContent.includes(req.resourceType())) {
    //     return req.abort()
    //   }
    //   req.continue()
    // })

    await page.goto(url)
    const content = await page.content()
    if (content.includes('<title>Pardon Our Interruption</title>')) {
      console.log(content)
      throw new Error('Failed to fetch page')
    }

    return page
  }

  const close = async () => {
    await Promise.all(pages.map(page => page.close()))
    await browser.close()
  }

  return {
    fetch: fetchPage,
    close
  }
}

export default createColesInterface