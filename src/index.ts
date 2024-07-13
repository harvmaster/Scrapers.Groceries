import { scrapeWoolworths } from './services/Woolworths'

import createAnalyticsCallbacks from './callbacks/analytics';
import createDatabaseCallbacks from './callbacks/database';

const scrape = async () => {
  const jobId = Math.random().toString(36).substring(7)

  const analyticCallbacks = createAnalyticsCallbacks(jobId)
  const databaseCallbacks = createDatabaseCallbacks(jobId, 'woolworths')

  await scrapeWoolworths(undefined, analyticCallbacks, databaseCallbacks)
}

scrape()