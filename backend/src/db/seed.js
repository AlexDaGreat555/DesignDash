// Standalone seed script — run with: npm run seed (from backend/)
// Clears the prompts table and re-inserts all seed data.

const db = require('./index')
const seedData = require('./seedData')

const clear = db.prepare('DELETE FROM prompts')
const insert = db.prepare(`
  INSERT INTO prompts
    (category, project_name, type, objective, background,
     target_audience, key_message, call_to_action, visual_direction)
  VALUES
    (@category, @project_name, @type, @objective, @background,
     @target_audience, @key_message, @call_to_action, @visual_direction)
`)

const run = db.transaction(() => {
  clear.run()
  for (const row of seedData) insert.run(row)
})

run()
console.log(`Seeded ${seedData.length} prompts across categories:`)

const counts = db
  .prepare('SELECT category, COUNT(*) AS n FROM prompts GROUP BY category ORDER BY category')
  .all()
counts.forEach(({ category, n }) => console.log(`  ${category}: ${n}`))
