import { base_url, details_url } from './Woolworths'


export type BaseURL = typeof base_url

export type SitemapURL = `${BaseURL}/${string}.xml`

export type StockCode = `${number}`

export type ShopBaseURL = `${BaseURL}/shop/productdetails`
export type ShopProductURL = `${BaseURL}/shop/productdetails/${StockCode}/${string}`

export type DetailsURL = typeof details_url
export type ProductDetailsBaseURL = `${BaseURL}/${DetailsURL}`
export type ProductDetailsURL = `${BaseURL}/${DetailsURL}/${StockCode}`

export type FetchOptions = {
  cookies: string;
  retry: boolean;
}

export type SitemapCallbacks = {
  onSitemap: (data: string) => void;
  onSitemapError: (error: Error) => void;
}

export type ProductURLSCallbacks = {
  onProductURLS: (data: ShopProductURL[]) => void;
}

export type ProductCallbacks = {
  beforeProduct: (url: ProductDetailsURL) => void;
  onRawProduct: (data: WoolworthsProduct) => void;
  onProductSuccess: (data: Product) => void;
  onProductError: (error: Error) => void;
}

export type ScrapingCallbacks = SitemapCallbacks & ProductURLSCallbacks & ProductCallbacks & {
  generateProductCallbacks: () => Partial<ProductCallbacks>;

  onStart: () => void;
  onProgress: (progress: number) => void;
  onError: (error: Error) => void;
  onFinish: (products: Product[]) => void; 
}

export type Product = {
  retailer: string;
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

export type WoolworthsProduct = {
  TileID: number;
  Stockcode: number;
  Barcode: string;
  GtinFormat: number;
  CupPrice: number;
  InstoreCupPrice: number;
  CupMeasure: string;
  CupString: string;
  InstoreCupString: string;
  HasCupPrice: boolean;
  InstoreHasCupPrice: boolean;
  Price: number;
  InstorePrice: number;
  Name: string;
  DisplayName: string;
  UrlFriendlyName: string;
  Description: string;
  SmallImageFile: string;
  MediumImageFile: string;
  LargeImageFile: string;
  IsNew: boolean;
  IsHalfPrice: boolean;
  IsOnlineOnly: boolean;
  IsOnSpecial: boolean;
  InstoreIsOnSpecial: boolean;
  IsEdrSpecial: boolean;
  SavingsAmount: number;
  InstoreSavingsAmount: number;
  WasPrice: number;
  InstoreWasPrice: number;
  QuantityInTrolley: number;
  Unit: string;
  MinimumQuantity: number;
  HasBeenBoughtBefore: boolean;
  IsInTrolley: boolean;
  Source: string;
  SupplyLimit: number;
  ProductLimit: number;
  MaxSupplyLimitMessage: string;
  IsRanged: boolean;
  IsInStock: boolean;
  PackageSize: string;
  IsPmDelivery: boolean;
  IsForCollection: boolean;
  IsForDelivery: boolean;
  IsForExpress: boolean;
  ProductRestrictionMessage: string;
  ProductWarningMessage: string;
  CentreTag: {
      TagContent: any;
      TagLink: any;
      FallbackText: any;
      TagType: string;
      MultibuyData: any;
      MemberPriceData: any;
      TagContentText: any;
      DualImageTagContent: any;
      PromotionType: string;
      IsRegisteredRewardCardPromotion: boolean;
  };
  IsCentreTag: boolean;
  ImageTag: {
      TagContent: any;
      TagLink: any;
      FallbackText: string;
      TagType: string;
      MultibuyData: any;
      MemberPriceData: any;
      TagContentText: any;
      DualImageTagContent: any;
      PromotionType: string;
      IsRegisteredRewardCardPromotion: boolean;
  };
  HeaderTag: any;
  HasHeaderTag: boolean;
  UnitWeightInGrams: number;
  SupplyLimitMessage: string;
  SmallFormatDescription: string;
  FullDescription: string;
  IsAvailable: boolean;
  InstoreIsAvailable: boolean;
  IsPurchasable: boolean;
  InstoreIsPurchasable: boolean;
  AgeRestricted: boolean;
  DisplayQuantity: number;
  RichDescription: any;
  HideWasSavedPrice: boolean;
  SapCategories: {
      SapDepartmentName: string;
      SapCategoryName: string;
      SapSubCategoryName: string;
      SapSegmentName: string;
  };
  Brand: any;
  IsRestrictedByDeliveryMethod: boolean;
  FooterTag: {
      TagContent: any;
      TagLink: any;
      FallbackText: any;
      TagType: string;
      MultibuyData: any;
      MemberPriceData: any;
      TagContentText: any;
      DualImageTagContent: any;
      PromotionType: string;
      IsRegisteredRewardCardPromotion: boolean;
  };
  IsFooterEnabled: boolean;
  Diagnostics: string;
  IsBundle: boolean;
  IsInFamily: boolean;
  ChildProducts: any[];
  UrlOverride: any;
  AdditionalAttributes: {
      boxedcontents: any;
      addedvitaminsandminerals: string;
      sapdepartmentname: string;
      spf: any;
  };
  DetailsImagePaths: string[];
  Variety: string;
  Rating: {
      ReviewCount: number;
      RatingCount: number;
      RatingSum: number;
      OneStarCount: number;
      TwoStarCount: number;
      ThreeStarCount: number;
      FourStarCount: number;
      FiveStarCount: number;
      Average: number;
      OneStarPercentage: number;
      TwoStarPercentage: number;
      ThreeStarPercentage: number;
      FourStarPercentage: number;
      FiveStarPercentage: number;
  };
  HasProductSubs: boolean;
  IsSponsoredAd: boolean;
  AdID: any;
  AdIndex: any;
  AdStatus: any;
  IsMarketProduct: boolean;
  IsGiftable: boolean;
  Vendor: any;
  Untraceable: boolean;
  ThirdPartyProductInfo: any;
  MarketFeatures: any;
  MarketSpecifications: any;
  SupplyLimitSource: string;
  Tags: any;
  IsPersonalisedByPurchaseHistory: boolean;
  IsFromFacetedSearch: boolean;
  NextAvailabilityDate: any;
  NumberOfSubstitutes: number;
  IsPrimaryVariant: boolean;
  VariantGroupId: number;
  HasVariants: boolean;
  VariantTitle: any;
  IsTobacco: boolean;
  IsB2BExtendedRangeSapCategory: boolean;
}

export type PrimaryCategory = {
  Department: string;
  Aisle: string;
  VisualShoppingAisleId: number;
  DisplayOrder: number;
  OverrideName: any;
  Instance: string;
}

export type CountryOfOriginLabel = {
  PngImageFile: string;
  SvgImageFile: string;
  AltText: string;
  CountryOfOrigin: string;
  IngredientPercentage: string;
  Disclaimer: any;
}

export type ProductDetailsResponse = {
  Product: WoolworthsProduct;
  Nutrition: any;
  VideoUrl: any;
  PrimaryCategory: PrimaryCategory;
  AdditionalAttributes: any;
  TgaAttributes: {
      Directions: any;
      ProductWarnings: any;
      SuitableFor: any;
      StorageInstructions: any;
  };
  DetailsImagePaths: string[];
  NutritionalInformation: any[];
  RichRelevancePlacements: any[];
  Variants: any[];
  VariantOptionGroups: any[];
  IsTobacco: boolean;
  CountryOfOriginLabel: CountryOfOriginLabel;
  DiagnosticsData: any;
}