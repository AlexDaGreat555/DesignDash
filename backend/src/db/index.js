const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const DB_PATH = path.join(DATA_DIR, 'design_dash.db')

// Ensure the data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id        TEXT PRIMARY KEY,
    mime_type TEXT NOT NULL,
    data      BLOB NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS prompts (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    category         TEXT    NOT NULL,
    project_name     TEXT    NOT NULL,
    type             TEXT    NOT NULL,
    objective        TEXT    NOT NULL,
    background       TEXT    NOT NULL,
    target_audience  TEXT    NOT NULL,
    key_message      TEXT    NOT NULL,
    call_to_action   TEXT    NOT NULL,
    visual_direction TEXT    NOT NULL,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Auto-seed on first run if the table is empty
const { count } = db.prepare('SELECT COUNT(*) AS count FROM prompts').get()
if (count === 0) {
  const seedData = require('./seedData')
  const insert = db.prepare(`
    INSERT INTO prompts
      (category, project_name, type, objective, background,
       target_audience, key_message, call_to_action, visual_direction)
    VALUES
      (@category, @project_name, @type, @objective, @background,
       @target_audience, @key_message, @call_to_action, @visual_direction)
  `)
  const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)))
  insertMany(seedData)
  console.log(`[db] Auto-seeded ${seedData.length} prompts`)
}

module.exports = db
