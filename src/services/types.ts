export type Product = {
  retailer_id: string;
  retailer_url: string;
  barcode: string;
  name: string;
  brand: string;
  description: string;
  images: string[];
  price: number;
  was_price: number;

  unit: string;

  category: string;
  subcategory: string;
}


export type ScraperOptions = {
  limit: number;
  callbacks: Partial<ScrapingCallbacks>[];
}
export type Scraper = (options: Partial<ScraperOptions>) => Promise<Product[]>

export type BasicScrapingCallbacks = {
  onStart: (meta?: unknown) => void;
  onProgress: (progress: number, meta?: unknown) => void;
  onError: (error: Error, meta?: unknown) => void;
  onFinish: (products: Product[], meta?: unknown) => void;
}

export type FetchCallbacks = {
  beforeFetch: (url: string, meta?: unknown) => void;
  onFetchSuccess: (data: unknown, meta?: unknown) => void;
  onFetchError: (error: Error, meta?: unknown) => void;
}

export type ProductCallbacks = {
  beforeProductRequest: (url: string, meta?: unknown) => void;
  onProductError: (error: Error, meta?: unknown) => void;
  onRawProduct: (data: unknown, meta?: unknown) => void;
  onProduct: (product: Product, meta?: unknown) => void;
}

export type ProductCallbackCreator = {
  generateProductCallbacks: () => Partial<ProductCallbacks>;
}

export type SitemapCallbacks = {
  onSitemap: (data: string, meta?: unknown) => void;
  onSitemapError: (error: Error, meta?: unknown) => void;
}

export type EndpointCallbacks = {
  onEndpoints: (endpoints: string[], meta?: unknown) => void;
}

export type ScrapingCallbacks = BasicScrapingCallbacks 
                                & FetchCallbacks
                                & ProductCallbacks
                                & ProductCallbackCreator
                                & SitemapCallbacks
                                & EndpointCallbacks
