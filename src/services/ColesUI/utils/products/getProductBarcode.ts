export const getProductBarcode = async (productId: string | number): Promise<string | undefined> => {
  const url = `https://barcodes.groceryscraper.mc.hzuccon.com/barcode?product=${productId}`
  const res = await fetch(url)

  if (!res.ok) {
    return undefined
  }

  const data = await res.text()
  return data
}

export default getProductBarcode