import { parseEmailWithRules } from './ruleBasedParser.js'

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY

const MANUAL_REVIEW_RESULT = {
  provider: 'Unknown',
  category: 'Other',
  amount: null,
  due_date: null,
  confidence: 'LOW',
  parsed_by: 'none',
  needs_review: true,
}

async function callClaudeAPI(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
  const data = await response.json()
  const text = data.content?.[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in Claude response')
  return JSON.parse(match[0])
}

export async function parseBillEmail({ body, subject, senderEmail }) {
  // Try rule-based parser first
  const ruled = parseEmailWithRules({ body, subject, senderEmail })
  if (ruled) return ruled

  // Fall back to Claude if API key is configured
  if (!CLAUDE_API_KEY) return MANUAL_REVIEW_RESULT

  const prompt = `Extract billing information from this email and return ONLY a JSON object with keys: provider, category, amount (number or null), due_date (YYYY-MM-DD or null), confidence (HIGH/MEDIUM/LOW).

Subject: ${subject || ''}
From: ${senderEmail || ''}
Body:
${(body || '').slice(0, 3000)}

Return only the JSON object, no explanation.`

  try {
    const parsed = await callClaudeAPI(prompt)
    return { ...parsed, parsed_by: 'claude', needs_review: false }
  } catch {
    return MANUAL_REVIEW_RESULT
  }
}

export async function parseBillPDF(pdfText) {
  const ruled = parseEmailWithRules({ body: pdfText, subject: '', senderEmail: '' })
  if (ruled) return ruled

  if (!CLAUDE_API_KEY) return MANUAL_REVIEW_RESULT

  const prompt = `Extract billing information from this PDF text and return ONLY a JSON object with keys: provider, category, amount (number or null), due_date (YYYY-MM-DD or null), confidence (HIGH/MEDIUM/LOW).

${(pdfText || '').slice(0, 3000)}

Return only the JSON object, no explanation.`

  try {
    const parsed = await callClaudeAPI(prompt)
    return { ...parsed, parsed_by: 'claude', needs_review: false }
  } catch {
    return MANUAL_REVIEW_RESULT
  }
}

export async function detectNewProvider(emailMetadata) {
  const { senderEmail, subject } = emailMetadata || {}
  const ruled = parseEmailWithRules({ body: '', subject, senderEmail })
  if (ruled) return { known: true, provider: ruled.provider }
  return { known: false, needs_review: true }
}
