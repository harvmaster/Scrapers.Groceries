import { scrapeWoolworths } from './services/Woolworths'
import scrapeColes from './services/Coles_v2/scrape';

import createAnalyticsCallbacks from './callbacks/analytics';
import createDatabaseCallbacks from './callbacks/database';

const scrape = async () => {
  // const jobId = Math.random().toString(36).substring(7)

  // const analyticCallbacks = createAnalyticsCallbacks(jobId)
  // const databaseCallbacks = createDatabaseCallbacks(jobId, 'woolworths')

  // await scrapeWoolworths(undefined, analyticCallbacks, databaseCallbacks)

  const colesJob = Math.random().toString(36).substring(7)

  const colesAnalytics = createAnalyticsCallbacks(colesJob)
  const colesDatabase = createDatabaseCallbacks(colesJob, 'coles')

  await scrapeColes({
    callbacks: [
      colesAnalytics,
      colesDatabase
    ]
  })
  
}

scrape()