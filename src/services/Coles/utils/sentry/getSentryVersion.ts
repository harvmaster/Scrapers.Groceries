import type { BaseCategory, CategoryUrl, SentryVersionString } from "../../types";

import { load } from 'cheerio'

export const getSentryVersion = async (category: BaseCategory): Promise<SentryVersionString> => {
  const response = await fetch(category, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.google.com/',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch category for Sentry URL: ${category}`)
  }

  const html = await response.text()
  console.log(html)

  // Load the HTML into Cheerio
  const $ = load(html);

  // Find the script tag with id "__NEXT_DATA__"
  const scriptContent = $('#__NEXT_DATA__').html();

  if (scriptContent) {
    // Parse the JSON content
    const data = JSON.parse(scriptContent);

    // Extract the _sentryBaggage string
    const sentryBaggage = data.props.pageProps._sentryBaggage;

    // Use the regex to extract the Sentry release
    const sentryReleaseRegex = /sentry-release=([^,]+)/;
    const match = sentryBaggage.match(sentryReleaseRegex);

    if (match && match[1]) {
      return match[1];
    }
  }

  throw new Error('Failed to extract Sentry release from category page');
}

export default getSentryVersion