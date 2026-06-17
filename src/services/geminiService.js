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

/**
 * Parse a single bill email.
 * 1. Try the fast, free rule-based parser (known Canadian providers).
 * 2. Fall back to Gemini for any email format the rules can't handle.
 * 3. If no key is set or the call fails, flag the email for manual review.
 */
export async function parseBillEmail({ body, subject, senderEmail }) {
  // Try rule-based parser first — instant and free for known providers.
  const ruled = parseEmailWithRules({ body, subject, senderEmail })
  if (ruled) return ruled

  // Fall back to Gemini only when the rules don't recognise the provider.
  if (!GEMINI_API_KEY) return MANUAL_REVIEW_RESULT

  const prompt = `You are a billing email parser. Extract structured bill data from the email below.
Return ONLY a valid JSON object with these exact keys:
  provider (string), category (one of: Telecom, Internet, Utilities, Streaming, Insurance, Kids, Other),
  amount (number or null), due_date (YYYY-MM-DD or null), confidence (HIGH, MEDIUM, or LOW).
Set confidence=LOW if this does not appear to be a billing/payment email.
Set confidence=HIGH if you found both amount and due_date.
Set confidence=MEDIUM if you found amount but not due_date.

From: ${senderEmail || ''}
Subject: ${subject || ''}
Body:
${(body || '').slice(0, 4000)}

Return only the JSON object, no explanation.`

  try {
    const parsed = await callGeminiAPI(prompt)
    return { ...parsed, parsed_by: 'gemini', needs_review: parsed.confidence !== 'HIGH' }
  } catch (e) {
    console.error('Gemini parse failed:', e.message)
    return MANUAL_REVIEW_RESULT
  }
}
