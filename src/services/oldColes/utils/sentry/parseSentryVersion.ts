// Helper type to extract parts of the version string
type ExtractParts<T extends string> = T extends `${infer Date}.${infer Build}_v${infer Version}`
  ? { date: Date; build: Build; version: Version }
  : never;

// Helper type to split the version into major, minor, patch
type SplitVersion<T extends string> = T extends `${infer Major}.${infer Minor}.${infer Patch}`
  ? { major: Major; minor: Minor; patch: Patch }
  : never;

// Main type for SentryRelease
type SentryRelease<T extends string> = ExtractParts<T> extends { date: infer D; build: infer B; version: infer V extends string }
  ? {
      date: D;
      buildNumber: B;
      version: SplitVersion<V> extends { major: infer M; minor: infer N; patch: infer P }
        ? {
            major: Number extends M ? number : M;
            minor: Number extends N ? number : N;
            patch: Number extends P ? number : P;
          }
        : never;
    }
  : never;

// Fully typed parseSentryRelease function
export const  parseSentryRelease = <T extends string>(releaseString: T): SentryRelease<T> => {
  const [dateBuild, versionString] = releaseString.split('_v');
  const [date, buildNumber] = dateBuild.split('.');
  const [major, minor, patch] = versionString.split('.').map(Number);

  return {
    date,
    buildNumber,
    version: {
      major,
      minor,
      patch
    }
  } as SentryRelease<T>;
}

export default parseSentryRelease;

// // Usage example:
// const releaseString = "20240709.01_v3.101.0";
// const release = parseSentryRelease(releaseString);

// // TypeScript will infer the following type for 'release':
// // {
// //   date: "20240709";
// //   buildNumber: "01";
// //   version: {
// //     major: 3;
// //     minor: 101;
// //     patch: 0;
// //   };
// // }

// console.log(release);