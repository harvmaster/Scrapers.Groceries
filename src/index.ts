import { scrapeWoolworths } from './services/Woolworths'

import createAnalyticsCallbacks from './callbacks/analytics';

const scrape = async () => {
  const jobId = Math.random().toString(36).substring(7)

  const analyticCallbacks = createAnalyticsCallbacks(jobId)

  const testCallbacks = {
    onProgress: (progress: number) => {
      console.log(progress)
    }
  }

  await scrapeWoolworths(40, analyticCallbacks, testCallbacks)
}

scrape()