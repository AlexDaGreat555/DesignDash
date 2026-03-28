const Anthropic = require('@anthropic-ai/sdk')
const db = require('../db')

let client = null
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

const JUDGE_PROMPT = `You are a strict, discerning design judge for a rapid design sprint competition.

You will be shown a design brief and a single submission. Your job is to score it honestly and independently — every design you see must be evaluated on its own merits against the brief.

Critical judging rules:
- Use the FULL range of scores. Weak designs should score 1.0–2.0, average designs 2.5–3.5, strong designs 4.0–5.0. Do NOT cluster scores around 3.0 or 4.0.
- Be harsh when the work does not match the brief. A visually appealing design that ignores the objective, target audience, or visual direction should score low.
- Be generous only when the work genuinely earns it — clear alignment with the brief, strong execution, and real creative thought.
- Each submission is independent. Score only what you see.

Score on a scale from 1.0 to 5.0 (one decimal place) across these dimensions:
- Brief alignment: Does it address the objective, key message, and target audience?
- Visual execution: Is it clear, polished, and intentional?
- Creativity: Does it bring a fresh or memorable angle within the constraints?

Respond with ONLY a single number between 1.0 and 5.0. No explanation, no text — just the number.`

/**
 * Score a design submission using Claude multimodal.
 * @param {string} submissionId - UUID of the submission stored in the DB
 * @param {object} spec - The design brief
 * @returns {Promise<number>} Score between 1.0 and 5.0
 */
async function scoreSubmission(submissionId, spec) {
  try {
    const row = db.prepare('SELECT mime_type, data FROM submissions WHERE id = ?').get(submissionId)
    if (!row) {
      console.warn(`[aiJudge] Submission not found in DB: ${submissionId}`)
      return 3.0
    }

    const briefContext = [
      `Project: ${spec.projectName}`,
      `Type: ${spec.type}`,
      `Objective: ${spec.objective}`,
      `Target Audience: ${spec.targetAudience}`,
      `Key Message: ${spec.keyMessage}`,
      `Visual Direction: ${spec.visualDirection}`,
    ].join('\n')

    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: JUDGE_PROMPT },
            { type: 'text', text: `\nDesign Brief:\n${briefContext}\n` },
            { type: 'image', source: { type: 'base64', media_type: row.mime_type, data: row.data.toString('base64') } },
          ],
        },
      ],
    })

    const text = response.content[0].text.trim()
    const score = parseFloat(text)

    if (isNaN(score)) {
      console.warn(`[aiJudge] Unexpected response for ${submissionId}: "${text}"`)
      return 3.0
    }

    return Math.round(Math.min(5.0, Math.max(1.0, score)) * 10) / 10
  } catch (err) {
    console.error(`[aiJudge] Scoring failed for ${submissionId}:`, err.message)
    return 3.0
  }
}

module.exports = { scoreSubmission }
