import { parseEmailWithRules } from './ruleBasedParser.js'

// Free-tier Gemini key from https://aistudio.google.com (no credit card required).
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// gemini-2.0-flash-lite: free tier, fast, generous rate limits (~30 req/min, 1500/day).
const GEMINI_MODEL = 'gemini-2.0-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// Returned when neither the rules nor the AI could parse the email — flagged for manual review.
const MANUAL_REVIEW_RESULT = {
  provider: 'Unknown',
  category: 'Other',
  amount: null,
  due_date: null,
  confidence: 'LOW',
  parsed_by: 'none',
  needs_review: true,
}

async function callGeminiAPI(prompt) {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 512 },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini API ${res.status}: ${err?.error?.message || res.statusText}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in Gemini response')
  return JSON.parse(match[0])
}

const PROMPT_HEADER = `You are a billing email parser. Extract structured bill data from the email below.
Return ONLY a valid JSON object with these exact keys:
  provider (string — the company/biller name, e.g. "Scotiabank", "Rogers"),
  category (one of: Telecom, Internet, Utilities, Streaming, Insurance, CreditCard, Kids, Other),
  amount (number or null — the total amount owed/charged; for a credit card statement use the statement balance, not the minimum payment),
  due_date (YYYY-MM-DD or null — the payment due date),
  confidence (HIGH, MEDIUM, or LOW).
Set confidence=LOW if this does not appear to be a billing/payment email.
Set confidence=HIGH if you found both amount and due_date.
Set confidence=MEDIUM if you found amount but not due_date.`

function buildPrompt({ body, subject, senderEmail }) {
  return `${PROMPT_HEADER}

From: ${senderEmail || ''}
Subject: ${subject || ''}
Body:
${(body || '').slice(0, 4000)}

Return only the JSON object, no explanation.`
}

/**
 * Parse a single bill email.
 * 1. AI-first: Gemini reads any email format and extracts the fields generically —
 *    no per-provider rules required, so it scales to any new biller automatically.
 * 2. If no key is set or the call fails, fall back to the offline rule-based parser
 *    (known Canadian providers), then to manual review.
 */
export async function parseBillEmail({ body, subject, senderEmail }) {
  // Primary path: let the AI parse it. Works for any provider, any template.
  if (GEMINI_API_KEY) {
    try {
      const parsed = await callGeminiAPI(buildPrompt({ body, subject, senderEmail }))
      if (parsed && parsed.confidence !== 'LOW' && parsed.amount != null) {
        return { ...parsed, parsed_by: 'gemini', needs_review: parsed.confidence !== 'HIGH' }
      }
      // Low confidence / no amount — try rules as a second opinion before giving up.
    } catch (e) {
      console.error('Gemini parse failed, falling back to rules:', e.message)
    }
  }

  // Fallback path: offline regex rules for known providers (also used when no key set).
  const ruled = parseEmailWithRules({ body, subject, senderEmail })
  if (ruled) return ruled

  return MANUAL_REVIEW_RESULT
}
