export const getProductBarcode = async (productId: string | number): Promise<string> => {
  const url = `https://barcodes.groceryscraper.mc.hzuccon.com/barcode?product=${productId}`
  const res = await fetch(url)
  const data = await res.text()
  return data
}

export default getProductBarcode