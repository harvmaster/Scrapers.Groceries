export type CategoryMapUrl = 'https://www.coles.com.au/sitemap/sitemap-categories.xml'

export type Category = string;
export type Subcategory = string;
export type SpecificCategory = string;

export type BrowseURL = `https://www.coles.com.au/browse`
export type CategoryURL = `${BrowseURL}/${Category}`
export type SubcategoryURL = `${BrowseURL}/${Category}/${Subcategory}`
export type SpecificCategoryURL = `${BrowseURL}/${Category}/${Subcategory}/${SpecificCategory}`

export type SentryVersionString = string;
export type SentryVersion = {
  date: string;
  buildNumber: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
};

export type API_Template = `https://www.coles.com.au/_next/data/${SentryVersionString}/en/browse/${Category}.json?page=${number}`

import type { Page } from 'playwright';
export type ColesInterface = {
  fetch: (url: string) => Promise<unknown>;
  page: Page;
  close: () => Promise<void>;
}

export type ImageUri = {
  altText: string;
  type: string;
  uri: string;
};

type Location = {
  aisleSide: string | null;
  description: string;
  facing: number;
  aisle: string | null;
  order: number;
  shelf: string | null;
};

type Restrictions = {
  retailLimit: number;
  promotionalLimit: number;
  liquorAgeRestrictionFlag: boolean;
  tobaccoAgeRestrictionFlag: boolean;
  restrictedByOrganisation: boolean;
  delivery: string[];
};

type MerchandiseHeir = {
  tradeProfitCentre: string;
  categoryGroup: string;
  category: string;
  subCategory: string;
  className: string;
};

type OnlineHeir = {
  aisle: string;
  category: string;
  subCategory: string;
  categoryId: string;
  aisleId: string;
  subCategoryId: string;
};

type UnitPricing = {
  quantity: number;
  ofMeasureQuantity: number;
  ofMeasureUnits: string;
  price: number;
  ofMeasureType: string;
  isWeighted: boolean;
};

type Pricing = {
  now: number;
  was: number;
  unit: UnitPricing;
  comparable: string;
  onlineSpecial: boolean;
};

export type ColesProduct = {
  _type: "PRODUCT" | "SINGLE_TILE";
  id: number;
  adId: string | null;
  adSource: string | null;
  featured: boolean;
  name: string;
  brand: string;
  description: string;
  size: string;
  availability: boolean;
  availabilityType: string;
  imageUris: ImageUri[];
  locations: Location[];
  restrictions: Restrictions;
  merchandiseHeir: MerchandiseHeir;
  onlineHeirs: OnlineHeir[];
  pricing: Pricing;
};

export type CategoryResponse = {
  pageProps: {
    searchResults: {
      pageSize: number;
      noOfResults: number;
      results: ColesProduct[];
    }
  };
}