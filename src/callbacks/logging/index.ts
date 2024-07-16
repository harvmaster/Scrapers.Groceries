import type { ScrapingCallbacks } from "../../services/types";

type StoreSummaries = Record<string, StoreSummary>;

type StoreSummary = {
  name: string;
  products: number;
  errors: number;
  progress: number;
}

export const createLoggingCallbacks = () => {
  const summary: StoreSummaries = {}

  const updateProgress = () => {
    const progress = Object.values(summary).reduce((acc, store) => {
      return acc + store.products;
    }, 0);

    const errors = Object.values(summary).reduce((acc, store) => {
      return acc + store.errors;
    }, 0);

    const storeProgresses = Object.values(summary).map(store => {
      return `${store.name}: ${store.products} Products (${store.progress}%)`;
    }).join(' | ');

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${progress} items scraped. ${errors} errors. [ ${storeProgresses} ]`);
  }

  const createStoreSpecificCallbacks = (storeName: string): Partial<ScrapingCallbacks> => {
    summary[storeName] = { name: storeName, products: 0, errors: 0, progress: 0 };

    return {
      onProduct: () => {
        summary[storeName].products++;

        updateProgress()
      },
      onError: () => {
        summary[storeName].errors++;

        updateProgress()
      },
      onFetchError: () => {
        summary[storeName].errors++;

        updateProgress()
      },
      onProgress: (val: number) => {
        summary[storeName].progress = val;

        updateProgress()
      }
    }
  }

  return createStoreSpecificCallbacks
}

export default createLoggingCallbacks()