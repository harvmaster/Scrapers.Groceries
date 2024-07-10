import type { 
  Product,
  ProductDetailsURL,
  ShopProductURL
} from './services/Woolworths'

import { scrapeWoolworths } from './services/Woolworths'

import analytics from './lib/analytics'

type AnalyticsData = {
  description: string;
  status: string;

  data: unknown;
}

type ScrapedResult = {
  status: 'success' | 'error';
  data: Product | Error;
}

const scrape = async () => {
  let productURLs: ShopProductURL[] | undefined
  const scraped: ScrapedResult[] = []

  const jobId = Math.random().toString(36).substring(7)
  const addAnalytics = (data: AnalyticsData): void => {
    analytics.insert({
      timestamp: new Date(),
      jobId,
      ...data
    })
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
    productURLs = data

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
      if (scraped.length % 10 === 0) {
        console.log(scraped.length, 'products scraped', scraped.filter(({ status }) => status === 'success').length, 'successes', scraped.filter(({ status }) => status === 'error').length, 'errors')
      }
    }
  
    return {
      beforeProduct,
      onProductSuccess,
      onProductError
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
    addAnalytics({
      description: 'scrape_finished',
      status: 'success',
      data: {}
    })
  }

  await scrapeWoolworths(40, {
    onSitemap,
    onSitemapError,
    onProductURLS,
    generateProductCallbacks: createProductAnalyticsHandlers,
    onError,
    onFinish
  })

  await analytics.toJSONFile()
}

scrape()