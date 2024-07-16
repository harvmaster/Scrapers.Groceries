import database from "../../lib/database";
import type { ScrapingCallbacks, Product } from "../../services/types";

const createDatabaseCallbacks = (jobId: string, retailer: string): Partial<ScrapingCallbacks> => {

  const addProduct = (data: Product): void => {
    database.insert(data, retailer, jobId)
  }
  
  const onProduct = (product: Product): void => {
    addProduct(product)
  }

  const onError = (error: Error): void => {
    console.error(error)
  }
  
  const onFinish = (): void => {
    database.toJSONFile(jobId)
  }

  const databaseCallbacks = {
    onProduct,
    onError,
    onFinish
  }

  return databaseCallbacks
}

export default createDatabaseCallbacks