import { Database } from 'bun:sqlite'
import fs from 'fs'
import type { Product } from '../services/Woolworths'

class ProductDatabase {
  private db: Database

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
  }

  async insert (product: Product, retailer: string, jobId: string = '') {
    // await this.db.run('INSERT INTO analytics (data, jobId) VALUES (?, ?)', [msg, jobId])
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
      product.barcode,
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

  async toJSONFile (jobId?: string) {
    const data = await this.get(jobId)
    fs.writeFileSync(`logs/products${jobId ? "-"+jobId : ''}.json`, JSON.stringify(data, null, 2))
  }
}

const database = new ProductDatabase()

export default database