import type { BaseCategory, CategoryUrl, SentryVersionString } from "../../types";

import { load } from 'cheerio'

import FetchInstance from '../fetchInstance'

export const getSentryVersion = async (category: BaseCategory): Promise<SentryVersionString> => {
  const response = await FetchInstance.fetch(category, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'en-AU,en;q=0.5',
      'Referer': 'https://www.google.com/',
      'Upgrade-Insecure-Requests': '0',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch category for Sentry URL: ${category}`)
  }

  const html = await response.text()
  console.log(html)

  // Load the HTML into Cheerio
  const $ = load(html);

  const scriptElementRegex = /scriptElement\.src\s*=\s*"([^"]+)"/
  const scriptElementMatch = html.match(scriptElementRegex);

  console.log('scriptElementMatch')
  console.log(scriptElementMatch)



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