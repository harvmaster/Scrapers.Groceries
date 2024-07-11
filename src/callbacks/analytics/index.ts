import analytics from "../../lib/analytics";
import type { WoolworthsProduct, ProductDetailsURL, ShopProductURL, ScrapingCallbacks, Product } from "../../services/Woolworths";

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
  
  const onProductURLS = (data: ShopProductURL[]): void => {
    addAnalytics({
      description: 'product_urls_extracted',
      status: 'success',
      data: {
        items: data,
        count: data.length
      }
    })
  }
  
  // Bit complicated because we need to store the productURL for the product, but I dont want to pass it as a variable to onProductSuccess and onProductError because I also want to be able to time it
  const createProductAnalyticsHandlers = () => {
    let productURL: ProductDetailsURL
    let startTime: Date
  
    const beforeProduct = (url: ProductDetailsURL): void => {
      productURL = url
      startTime = new Date()
    }
  
    const onProductSuccess = (product: Product): void => {
      const duration = new Date().getTime() - startTime.getTime()
      onProduct({ status: 'success', data: product })
  
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
      onProduct({ status: 'error', data: error })
  
      addAnalytics({
        description: 'product_scraped',
        status: 'error',
        data: {
          duration,
          error,
          productURL
        }
      })
    }

    const onProduct = (data: ScrapedResult) => {
      scraped.push(data)
    }
  
    return {
      beforeProduct,
      onProductSuccess,
      onProductError
    }
  }

  const onStart = (): void => {
    startTime = new Date()

    addAnalytics({
      description: 'scrape_started',
      status: 'success',
      data: {}
    })
  }

  const onProgress = (progress: number): void => {
    if (progress % 10 === 0) {
      console.log(scraped.length, 'products scraped', scraped.filter(({ status }) => status === 'success').length, 'successes', scraped.filter(({ status }) => status === 'error').length, 'errors')
    }
  }

  const onError = (error: Error): void => {
    addAnalytics({
      description: 'error',
      status: 'error',
      data: {
        error
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
    onProductURLS,
    generateProductCallbacks: createProductAnalyticsHandlers,
    onStart,
    onProgress,
    onError,
    onFinish
  }

  return analyticCallbacks
}

export default createAnalyticsCallbacks