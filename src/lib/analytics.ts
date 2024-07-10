import { Database } from 'bun:sqlite'
import fs from 'fs'

class Analytics {
  private db: Database

  constructor () {
    this.db = new Database('analytics.sqlite')
    this.db.run('CREATE TABLE IF NOT EXISTS analytics (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT)')
  }

  async insert (message: unknown) {
    const msg = JSON.stringify(message)
    await this.db.run('INSERT INTO analytics (message) VALUES (?)', [msg])
  }

  async get () {
    const rows = await this.db.query('SELECT * FROM analytics').all() as unknown[]
    return rows.map((row: any) => JSON.parse(row.message))
  }

  async clear () {
    await this.db.run('DELETE FROM analytics')
  }

  async toJSONFile (name?: string) {
    const data = await this.get()
    fs.writeFileSync(`${name || 'analytics'}.json`, JSON.stringify(data, null, 2))
  }
}

const analytics = new Analytics()

export default analytics