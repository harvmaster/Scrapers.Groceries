import { Database } from 'bun:sqlite'
import fs from 'fs'

class Analytics {
  private db: Database

  constructor () {
    this.db = new Database('analytics.sqlite')
    this.db.run('CREATE TABLE IF NOT EXISTS analytics (id INTEGER PRIMARY KEY AUTOINCREMENT, jobId TEXT, data Text)')
  }

  async insert (message: unknown, jobId: string = '') {
    const msg = JSON.stringify(message)
    await this.db.run('INSERT INTO analytics (data, jobId) VALUES (?, ?)', [msg, jobId])
  }

  async get (jobId: string = '') {
    if (jobId) {
      const rows = await this.db.query(`SELECT * FROM analytics WHERE jobId = ?`).all(jobId) as unknown[]
      return rows.map((row: any) => JSON.parse(row.data))
    }

    const rows = await this.db.query('SELECT * FROM analytics').all() as unknown[]
    return rows.map((row: any) => JSON.parse(row.data))
  }

  async clear () {
    await this.db.run('DELETE FROM analytics')
  }

  async toJSONFile (batchId: string, jobId: string, outputDir?: string) {
    const data = await this.get(jobId)

    let path = `logs`

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }

    const totalLogs = fs.readdirSync(path).length

    path = `${path}/${batchId}-${totalLogs}`

    if (!fs.existsSync(path)) {
      path = `logs/${batchId}-${totalLogs + 1}`
      fs.mkdirSync(path)
    }

    if (outputDir) {
      path = `${path}/${outputDir}`
      
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
      }
    }
      
    fs.writeFileSync(`${path}/analytics-${jobId}.json`, JSON.stringify(data, null, 2))
    // fs.writeFileSync(`logs/${jobId}-${dateString}/analytics-${jobId}.json`, JSON.stringify(data, null, 2))
  }
}

const analytics = new Analytics()

export default analytics