import analytics from "../../lib/analytics";
import type { ScrapingCallbacks, Product } from "../../services/types";

type AnalyticsData = {
  description: string;
  status: string;

  data: unknown;
}

type ScrapedResult = {
  status: 'success' | 'error';
  data: Product | Error;
}

const createAnalyticsCallbacks = (jobId: string): Partial<ScrapingCallbacks> => {
  let startTime: Date;
  let finishTime: Date;
  
  const scraped: ScrapedResult[] = []

  const addAnalytics = (data: AnalyticsData): void => {
    analytics.insert({
      timestamp: new Date(),
      jobId,
      ...data
    }, jobId)
  }

  const onSitemap = (data: string): void => {
    addAnalytics({
      description: 'sitemap_extracted',
      status: 'success',
      data: {
        items: data,
        count: data.length
      }
    })
  }
  
  const onSitemapError = (error: Error): void => {
    addAnalytics({
      description: 'sitemap_extracted',
      status: 'error',
      data: {
        error
      }
    })
  }
  
  const onEndpoints = (data: string[]): void => {
    addAnalytics({
      description: 'endpoints_extracted',
      status: 'success',
      data: {
        items: data,
        count: data.length
      }
    })
  }
  
  // Bit complicated because we need to store the productURL for the product, but I dont want to pass it as a variable to onProductSuccess and onProductError because I also want to be able to time it
  const createProductAnalyticsHandlers = () => {
    let productURL: string
    let startTime: Date
  
    const beforeProductRequest = (url: string): void => {
      productURL = url
      startTime = new Date()
    }

    const onRawProduct = (product: unknown): void => {
      const duration = new Date().getTime() - startTime.getTime()

      addAnalytics({
        description: 'raw_product_scraped',
        status: 'success',
        data: {
          duration,
          product,
          productURL
        }
      })
    }
  
    const onProduct = (product: Product): void => {
      const duration = new Date().getTime() - startTime.getTime()
      storeProduct({ status: 'success', data: product })
  
      addAnalytics({
        description: 'product_scraped',
        status: 'success',
        data: {
          duration,
          product,
          productURL
        }
      })
    }
  
    const onProductError = (error: Error): void => {
      const duration = new Date().getTime() - startTime.getTime()
      storeProduct({ status: 'error', data: error })
  
      addAnalytics({
        description: 'product_scraped',
        status: 'error',
        data: {
          duration,
          error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
          productURL
        }
      })
    }

    const storeProduct = (data: ScrapedResult) => {
      scraped.push(data)
    }
  
    return {
      beforeProductRequest,
      onRawProduct,
      onProduct,
      onProductError
    }
  }

  const onFetchError = (error: Error, meta: unknown): void => {
    addAnalytics({
      description: 'fetch_error',
      status: 'error',
      data: {
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        meta
      }
    })
  }

  const onStart = (): void => {
    startTime = new Date()

    addAnalytics({
      description: 'scrape_started',
      status: 'success',
      data: {}
    })
  }

  const onError = (error: Error, meta: unknown): void => {
    addAnalytics({
      description: 'error',
      status: 'error',
      data: {
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        meta
      }
    })
  }
  
  const onFinish = (): void => {
    finishTime = new Date()

    addAnalytics({
      description: 'scrape_finished',
      status: 'success',
      data: {}
    })

    analytics.toJSONFile(jobId)
  }

  const analyticCallbacks = {
    onSitemap,
    onSitemapError,
    onEndpoints,
    generateProductCallbacks: createProductAnalyticsHandlers,
    onFetchError,
    onStart,
    onError,
    onFinish
  }

  return analyticCallbacks
}

export default createAnalyticsCallbacks