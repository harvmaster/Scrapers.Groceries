export const getCookies = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    redirect: 'follow'
  })
  // if (!response.ok) {
  //   console.error(response)
  //   throw new Error(`Failed to get cookies: ${url}`)
  // }
  
  const cookies = response.headers.get('set-cookie')
  if (!cookies) {
    throw new Error(`Failed to get cookies: ${url}`)
  }

  return cookies
}

export default getCookies