import type { SpecificCategoryURL } from '../../types';

import fs from 'fs';

// export const extractCategoriesSitemap = async (fetch: (url: string) => Promise<Page>, sitemapUrl: CategoryMapUrl): Promise<SpecificCategoryURL[]> => {
  export const extractCategoriesSitemap = (): SpecificCategoryURL[] => {
  const pwd = process.cwd();
  const sitemap = fs.readFileSync(`${pwd}/src/services/Coles/sitemap/Categories_09-07-2024.xml`, 'utf8');

  // Get the categories from the sitemap with puppeteer
  const categoryRegex = /<loc>([^<]+)<\/loc>/g;
  const categories = [];
  let match;
  while ((match = categoryRegex.exec(sitemap))) {
    categories.push(match[1]);
  }
  
  return categories as SpecificCategoryURL[];
}

export default extractCategoriesSitemap