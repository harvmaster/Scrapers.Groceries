import type { Cookie } from 'playwright';

import fs from 'fs';

const cookiePath = 'cookies.json';

export const saveCookies = (cookies: Cookie[]) => {
  const pwd = process.cwd();
  const path = `${pwd}/src/services/Coles/utils/persistentCookies/${cookiePath}`;

  const data = {
    cookies
  }

  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

export const loadCookies = (): Cookie[] => {
  const pwd = process.cwd();
  const path = `${pwd}/src/services/Coles/utils/persistentCookies/${cookiePath}`;

  const cookies = fs.readFileSync(path, 'utf-8');

  return JSON.parse(cookies).cookies;
}

