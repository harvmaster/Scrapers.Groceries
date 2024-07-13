import database from "../../lib/database";
import type { ScrapingCallbacks, Product } from "../../services/Woolworths";

const createDatabaseCallbacks = (jobId: string, retailer: string): Partial<ScrapingCallbacks> => {

  const addProduct = (data: Product): void => {
    database.insert(data, retailer, jobId)
  }
  
  const onProductSuccess = (product: Product): void => {
    addProduct(product)
  }

  const onProgress = (progress: number): void => {
    console.log(`completed ${progress}`)
  }

  const onError = (error: Error): void => {
    console.error(error)
  }
  
  const onFinish = (): void => {
    database.toJSONFile(jobId)
  }

  const databaseCallbacks = {
    onProductSuccess,
    onProgress,
    onError,
    onFinish
  }

  return databaseCallbacks
}

export default createDatabaseCallbacks