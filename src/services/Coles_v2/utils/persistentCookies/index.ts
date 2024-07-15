import type { Cookie } from 'playwright';

import fs from 'fs';

const cookiePath = 'cookies.json';

export const saveCookies = (cookies: Cookie[]) => {
  const pwd = process.cwd();
  const path = `${pwd}/src/services/Coles_v2/utils/persistentCookies/${cookiePath}`;

  const data = {
    cookies
  }

  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

export const loadCookies = (): Cookie[] => {
  const pwd = process.cwd();
  const path = `${pwd}/src/services/Coles_v2/utils/persistentCookies/${cookiePath}`;
  // console.log(path)

  const cookiesString = fs.readFileSync(path, 'utf-8');
  const cookies = JSON.parse(cookiesString).cookies;

  return cookies.filter((cookie: Cookie) => {
    return cookie.expires === -1 || cookie.expires > (Date.now() / 1000);
  });
}

