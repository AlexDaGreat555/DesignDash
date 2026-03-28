const db = require('../db')

// Shared helper — maps a DB row to the API shape
function toPrompt(row) {
  return {
    id:             row.id,
    category:       row.category,
    projectName:    row.project_name,
    type:           row.type,
    objective:      row.objective,
    background:     row.background,
    targetAudience: row.target_audience,
    keyMessage:     row.key_message,
    callToAction:   row.call_to_action,
    visualDirection:row.visual_direction,
    createdAt:      row.created_at,
  }
}

// GET /api/prompts?category=Branding
function listPrompts(req, res) {
  const { category } = req.query
  const rows = category
    ? db.prepare('SELECT * FROM prompts WHERE category = ? ORDER BY id').all(category)
    : db.prepare('SELECT * FROM prompts ORDER BY category, id').all()
  res.json(rows.map(toPrompt))
}

// GET /api/prompts/categories
function listCategories(req, res) {
  const rows = db
    .prepare('SELECT DISTINCT category FROM prompts ORDER BY category')
    .all()
  res.json(rows.map((r) => r.category))
}

// GET /api/prompts/:id
function getPrompt(req, res) {
  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Prompt not found' })
  res.json(toPrompt(row))
}

// POST /api/prompts
function createPrompt(req, res) {
  const { category, projectName, type, objective, background,
          targetAudience, keyMessage, callToAction, visualDirection } = req.body

  if (!category || !projectName || !objective) {
    return res.status(400).json({ error: 'category, projectName, and objective are required' })
  }

  const { lastInsertRowid } = db.prepare(`
    INSERT INTO prompts
      (category, project_name, type, objective, background,
       target_audience, key_message, call_to_action, visual_direction)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(category, projectName, type, objective, background,
         targetAudience, keyMessage, callToAction, visualDirection)

  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(lastInsertRowid)
  res.status(201).json(toPrompt(row))
}

// PUT /api/prompts/:id
function updatePrompt(req, res) {
  const existing = db.prepare('SELECT id FROM prompts WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Prompt not found' })

  const { category, projectName, type, objective, background,
          targetAudience, keyMessage, callToAction, visualDirection } = req.body

  db.prepare(`
    UPDATE prompts SET
      category = COALESCE(?, category),
      project_name = COALESCE(?, project_name),
      type = COALESCE(?, type),
      objective = COALESCE(?, objective),
      background = COALESCE(?, background),
      target_audience = COALESCE(?, target_audience),
      key_message = COALESCE(?, key_message),
      call_to_action = COALESCE(?, call_to_action),
      visual_direction = COALESCE(?, visual_direction)
    WHERE id = ?
  `).run(category, projectName, type, objective, background,
         targetAudience, keyMessage, callToAction, visualDirection,
         req.params.id)

  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id)
  res.json(toPrompt(row))
}

// DELETE /api/prompts/:id
function deletePrompt(req, res) {
  const { changes } = db.prepare('DELETE FROM prompts WHERE id = ?').run(req.params.id)
  if (!changes) return res.status(404).json({ error: 'Prompt not found' })
  res.json({ ok: true })
}

module.exports = { listPrompts, listCategories, getPrompt, createPrompt, updatePrompt, deletePrompt }
