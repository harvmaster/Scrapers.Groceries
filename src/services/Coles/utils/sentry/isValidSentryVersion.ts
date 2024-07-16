export const isValidSentryVersion = (release: string): boolean => {
  const regex = /^(\d{8})\.(\d+)_v(\d+)\.(\d+)\.(\d+)$/;
  if (!regex.test(release)) return false;

  const [, date, buildNumber, major, minor, patch] = regex.exec(release)!;

  // Validate date (basic check, doesn't account for leap years or invalid months/days)
  const year = parseInt(date.slice(0, 4));
  const month = parseInt(date.slice(4, 6));
  const day = parseInt(date.slice(6, 8));
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  // Validate build number (non-zero)
  if (parseInt(buildNumber) === 0) return false;

  // Validate semantic versioning
  if (parseInt(major) === 0 && parseInt(minor) === 0 && parseInt(patch) === 0) return false;

  return true;
}

export default isValidSentryVersion;