import type { Product } from "../../services/types";
import { ItemTagging} from '../../../config'

export type CompleteProduct = Product & {
  tags: string[];
  barcode?: string;
}

const MAX_BATCH_SIZE = 30;

export class ProductTagger {
  private products: { product: Product, done: (product: CompleteProduct) => void }[] = []
  private timer: Timer | null = null;

  getProductTags(product: Product): Promise<CompleteProduct> {
    return new Promise((resolve) => {
      this.products.push({ product, done: resolve })

      if (this.products.length > 30) {
        this.processProductBatch()
        this.timer = null;
      }
      else if (!this.timer) {
        this.timer = setTimeout(() => {
          this.processProductBatch()
          this.timer = null;
        }, 1000)
      }
    })
  }

  processProductBatch() {
    // determine the size of the batch. If there are less than 30 products, use the length of the products array
    const batchSize = Math.min(this.products.length, MAX_BATCH_SIZE);

    // Get the products to process
    const products = this.products.splice(0, batchSize);

    // Create a batch of products to send to the API
    const batch = products.map(queuedProduct => {
      const product = queuedProduct.product;

      return {
        name: product.name,
        description: product.description,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory
      }
    })

    // Call the API to process the batch



  }
}
