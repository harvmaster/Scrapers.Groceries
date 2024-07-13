import fetchCookie, { type FetchCookieImpl } from "fetch-cookie";

class FetchInstance {
  private FetchCookieInstance: Promise<FetchCookieImpl<string | URL | Request, FetchRequestInit, Response>>

  constructor (url: string) {

    this.FetchCookieInstance = new Promise(async (res, rej) => {
      const instance = fetchCookie(fetch)
      const response = await instance(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-AU,en;q=0.5',
          'Referer': 'https://www.google.com/',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'cross-site',
        },
        redirect: 'follow',
        credentials: 'include',
        tls: { rejectUnauthorized: false }
      })
      console.log(await response.text())
      res(instance)
    })

  }

  public async fetch (url: string, options?: FetchRequestInit): Promise<Response> {
    const instance = await this.FetchCookieInstance
    return instance(url, { ...options, tls: { rejectUnauthorized: false } })
  }

}

const instance = new FetchInstance('https://www.coles.com.au')

export default instance