import { test, describe, expect, mock, afterAll } from 'bun:test';

import getSentryVersion from '../utils/sentry/getSentryVersion'; // Adjust the import path as needed
import isValidSentryVersion from '../utils/sentry/isValidSentryVersion'; // Adjust the import path as needed

// Mock the fetch function
const originalFetch = global.fetch;
afterAll(() => {
  global.fetch = originalFetch;
});

const colesCategoryURL = "https://www.coles.com.au/browse/test/test/test"

test("getSentryRelease", async () => {
  test("should extract a valid Sentry release", async () => {
    const mockHtml = `
      <script id="__NEXT_DATA__" type="application/json">
        {
          "props": {
            "pageProps": {
              "_sentryBaggage": "sentry-environment=prod,sentry-release=20240709.01_v3.101.0,sentry-transaction=%2Fbrowse%2F%5B...slug%5D"
            }
          }
        }
      </script>
    `;

    global.fetch = mock(() =>
      Promise.resolve({
        text: () => Promise.resolve(mockHtml),
      } as Response)
    );

    const release = await getSentryVersion(colesCategoryURL);
    expect(release).toBe("20240709.01_v3.101.0");
    expect(isValidSentryVersion(release)).toBe(true);
  });

  test("should return null for invalid HTML", async () => {
    const mockHtml = "<html><body>Invalid HTML</body></html>";
    global.fetch = mock(() =>
      Promise.resolve({
        text: () => Promise.resolve(mockHtml),
      } as Response)
    );

    const release = await getSentryVersion(colesCategoryURL);
    expect(release).toBeNull();
  });

  test("should handle network errors", async () => {
    global.fetch = mock(() => Promise.reject(new Error("Network error")));

    const release = await getSentryVersion(colesCategoryURL);
    expect(release).toBeNull();
  });
});

describe('isValidSentryVersion', () => {
  test('should validate correct Sentry release strings', () => {
    expect(isValidSentryVersion('20240709.01_v3.101.0')).toBe(true);
    expect(isValidSentryVersion('20230101.10_v1.0.0')).toBe(true);
    expect(isValidSentryVersion('20251231.99_v10.20.30')).toBe(true);
  });

  test('should reject invalid Sentry release strings', () => {
    expect(isValidSentryVersion('invalid')).toBe(false);
    expect(isValidSentryVersion('20240709.01v3.101.0')).toBe(false); // Missing underscore
    expect(isValidSentryVersion('20240709.00_v3.101.0')).toBe(false); // Build number can't be zero
    expect(isValidSentryVersion('20240709.01_v0.0.0')).toBe(false); // Invalid semantic version
    expect(isValidSentryVersion('99999999.01_v1.0.0')).toBe(false); // Invalid date
  });
});