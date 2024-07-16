import database from "../../lib/database";
import type { ScrapingCallbacks, Product } from "../../services/types";

type DatabaseOptions = {
  retailer: string;
  outputDir: string;
  batchId: string;
}

const defaultOptions: DatabaseOptions = {
  retailer: '',
  outputDir: '',
  batchId: ''
}

const createDatabaseCallbacks = (scraperId: string, options?: Partial<DatabaseOptions>): Partial<ScrapingCallbacks> => {
  options = { ...defaultOptions, ...options }
 
  const addProduct = (data: Product): void => {
    database.insert(data, options.retailer as string, scraperId)
  }
  
  const onProduct = (product: Product): void => {
    addProduct(product)
  }

  const onError = (error: Error): void => {
    console.error(error)
  }
  
  const onFinish = (): void => {
    database.toJSONFile(options.batchId || '', scraperId, options?.outputDir)
  }

  const databaseCallbacks = {
    onProduct,
    onError,
    onFinish
  }

  return databaseCallbacks
}

export default createDatabaseCallbacks