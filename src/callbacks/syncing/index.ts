import type { Product, ScrapingCallbacks } from "../../services/types";

import { ScraperKey, ScraperURL } from '../../../config'

const createSyncingCallbacks = (scraperId: string, options?: Partial<{}>): Partial<ScrapingCallbacks> => {
  const onStart = (): void => { 
    console.log('Syncing started')
  }

  const onProduct = async (product: Product): Promise<void> => {
    try {
      const res = await fetch(ScraperURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product,
          scraperKey: ScraperKey
        })
      })

      if (!res.ok) {
        console.log(product)
        throw new Error(`Failed to sync product (${product.description} [${product.retailer}]) ${await res.text()}`)
      }

    } catch (err) {
      console.error(err)
    }
  }

  const onFinish = (): void => {
    console.log('Syncing finished')
  }

  return {
    onStart,
    onProduct,
    onFinish,
  }
}

export default createSyncingCallbacks