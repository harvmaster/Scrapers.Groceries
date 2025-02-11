import { Database } from 'bun:sqlite'
import fs from 'fs'
import type { Product } from '../types'
import Queue from './queue'

type TimestampedProduct = { timestamp: number } & Product

class ProductDatabase {
  private db: Database
  private queue: Queue

  constructor () {
    this.db = new Database('products.sqlite')
    this.db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobId TEXT,
        retailer TEXT,
        retailer_id TEXT,
        retailer_url TEXT,
        barcode TEXT,
        name TEXT,
        brand TEXT,
        description TEXT,
        images TEXT,
        price REAL,
        was_price REAL,
        unit TEXT,
        category TEXT,
        subcategory TEXT
      )`)

    this.queue = new Queue()
  }

  async insert (product: Product, retailer: string, jobId: string = '') {
    this.queue.add(async () => {
      await this.db.run(`INSERT INTO products (
          retailer,
          retailer_id,
          retailer_url,
          barcode,
          name,
          brand,
          description,
          images,
          price,
          was_price,
          unit,
          category,
          subcategory,
          jobId
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        retailer,
        product.retailer_id,
        product.retailer_url,
        product.barcode || '',
        product.name,
        product.brand,
        product.description,
        JSON.stringify(product.images),
        product.price,
        product.was_price,
        product.unit,
        product.category,
        product.subcategory,
        jobId
      ])
    })
  }

  async get (jobId: string = '') {
    if (jobId) {
      const rows = await this.db.query(`SELECT * FROM products WHERE jobId = ?`).all(jobId) as unknown[]
      return rows
    }

    const rows = await this.db.query('SELECT * FROM products').all() as unknown[]
    return rows
    // return rows.map((row: any) => JSON.parse(row.data))
  }

  async clear () {
    await this.db.run('DELETE FROM products')
  }

  async toJSONFile (batchId: string, jobId: string, outputDir?: string) {
    // Get the products from the database
    const data = await this.get(jobId) as Product[]

    // Add timestamp to each product. This is horrible for memory usage but it's fine for now
    const products: TimestampedProduct[] = data.map(product => {
      const timestamp = new Date().getTime()
      return { timestamp, ...product }
    })

    // Calculate the path to save the file
    let path = `logs`

    // Check if the logs directory exists, if not create it
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }

    // Get the total number of logs in the directory
    const totalLogs = fs.readdirSync(path).length

    // Create a new directory for the batch of logs
    path = `${path}/${batchId}-${totalLogs}`

    // Check if the directory exists, if not create it with a new number
    if (!fs.existsSync(path)) {
      path = `logs/${batchId}-${totalLogs + 1}`
      fs.mkdirSync(path)
    }

    // Check if an output directory is specified, if so create it
    if (outputDir) {
      path = `${path}/${outputDir}`
      
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
      }
    }

    // Write the products to a file
    fs.writeFileSync(`${path}/products-${jobId}.json`, JSON.stringify(products, null, 2))
  }
}

const database = new ProductDatabase()

export default database