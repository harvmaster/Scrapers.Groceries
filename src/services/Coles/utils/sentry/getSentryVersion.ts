import type { Page } from 'playwright';

import type { CategoryURL, SentryVersionString } from '../../types';

export const getSentryVersion = async (fetch: (url: string) => Promise<Page>, categoryURL: CategoryURL): Promise<SentryVersionString> => {
  console.log('getting sentry version')
  const page = await fetch(categoryURL);
  console.log('got page')

  // Find the script tag with id "__NEXT_DATA__"
  const scriptContent = await page.$eval('#__NEXT_DATA__', (el) => el.innerHTML);

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