import fetchCookie, { type FetchCookieImpl } from "fetch-cookie";

class FetchInstance {
  private FetchCookieInstance: Promise<FetchCookieImpl<string | URL | Request, FetchRequestInit, Response>>

  constructor (url: string) {

    this.FetchCookieInstance = new Promise(async (res, rej) => {
      const instance = fetchCookie(fetch)
      const response = await instance(url, {
        redirect: 'follow'
      })
      res(instance)
    })

  }

  public async fetch (url: string, options?: FetchRequestInit): Promise<Response> {
    const instance = await this.FetchCookieInstance
    return instance(url, options)
  }

}

const instance = new FetchInstance('https://www.woolworths.com.au')

export default instance