// import { CATEGORIES_SITEMAP } from "./Coles"
// import extractBaseCategory from "./utils/extractBaseCategory"
// import getCategoryUrls from "./utils/getCategoryUrls"
// import scrapeCategory from "./utils/scrapeCategory"

// const dedupe = <T>(arr: T[]) => Array.from(new Set(arr))


// export const scrapeColes = async ( ) => {
//   const allCategories = await getCategoryUrls(CATEGORIES_SITEMAP)
//   console.log(allCategories.length)
  
//   const categories = dedupe(allCategories.map((extractBaseCategory))).slice(0, 1)
//   console.log(categories)


//   const products = (await Promise.all(categories.map(scrapeCategory))).flat()

//   console.log(products.length)
//   return products
// }

// export default scrapeColes

import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

export const scrapeColes = async () => {

  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';

  const browser = await puppeteer.launch({
  headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })

  const page = await browser.newPage()
  await page.setUserAgent(userAgent)
  
  await page.goto('https://www.coles.com.au/browse')

  console.log('Scraping Coles')
  console.log(await page.content())

  const categoryCardElements = await page.$$('[data-testid="category-card"]')
  console.log(categoryCardElements)

  const categoriesUnfiltered = await Promise.all(categoryCardElements.map(async (el) => {
    const href = await el?.getProperty('href')
    const url = await href?.jsonValue() as string
    const category = await el?.getProperty('textContent').then(txt => txt.jsonValue())
    return { name: category, url }
  }))

  console.log(categoriesUnfiltered)


  await browser.close()
}

export default scrapeColes