import type { Product, Scraper } from './services/types';

import { scrapeWoolworths } from './services/Woolworths'
import scrapeColes from './services/Coles/scrape';

import createAnalyticsCallbacks from './callbacks/analytics';
import createDatabaseCallbacks from './callbacks/database';
import createLoggingCallbacks from './callbacks/logging';


const scrape = async () => {
  const scrapers = [
    createScraper('Woolworths', scrapeWoolworths),
    createScraper('Coles', scrapeColes)
  ]

  const results = await Promise.all(scrapers.map(scraper => scraper()))
  console.log(`Finished Scraping ${results.flat().length} products`)
}

const createScraper = (name: string, scraper: Scraper): () => Promise<Product[]> => {
  const jobId = Math.random().toString(36).substring(7)

  const analyticCallbacks = createAnalyticsCallbacks(jobId)
  const databaseCallbacks = createDatabaseCallbacks(jobId, name)
  const loggingCallbacks = createLoggingCallbacks(name)

  return async () => scraper({
    callbacks: [
      analyticCallbacks,
      databaseCallbacks,
      loggingCallbacks
    ]
  })
}

scrape()
