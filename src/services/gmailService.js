const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1'
const VIRKAR_EMAIL = 'virkar.bills@gmail.com'

function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

async function gmailGet(path, token, params = {}) {
  const url = new URL(`${GMAIL_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { headers: authHeader(token) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gmail API ${res.status}: ${err?.error?.message || res.statusText}`)
  }
  return res.json()
}

function decodeBase64(str) {
  try {
    return decodeURIComponent(
      escape(atob(str.replace(/-/g, '+').replace(/_/g, '/')))
    )
  } catch {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
  }
}

// Recursively collect all text segments from every MIME part (including
// nested message/rfc822 parts that Gmail uses for forwarded emails).
function collectTextParts(payload, parts = []) {
  if (!payload) return parts

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    parts.push({ type: 'plain', text: decodeBase64(payload.body.data) })
  } else if (payload.mimeType === 'text/html' && payload.body?.data) {
    const raw = decodeBase64(payload.body.data)
    parts.push({ type: 'html', text: raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() })
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      collectTextParts(part, parts)
    }
  }

  return parts
}

// Pick the richest text from all collected parts.
// Prefer the longest plain-text segment (likely the actual bill body inside
// a forwarded message), falling back to the longest HTML-stripped segment.
function extractBody(payload) {
  const parts = collectTextParts(payload)
  if (!parts.length) return ''

  const plains = parts.filter(p => p.type === 'plain').sort((a, b) => b.text.length - a.text.length)
  if (plains.length) return plains[0].text

  const htmls = parts.filter(p => p.type === 'html').sort((a, b) => b.text.length - a.text.length)
  if (htmls.length) return htmls[0].text

  return ''
}

function getHeader(headers, name) {
  return headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
}

/**
 * Fetch all emails from virkar.bills@gmail.com inbox.
 * token    — OAuth access token from the logged-in skv.labs1 user
 * maxResults — how many messages to fetch (default 100)
 */
export async function fetchBillEmails(token, { maxResults = 100, since = null } = {}) {
  const params = {
    userId: VIRKAR_EMAIL,
    maxResults,
  }
  if (since) {
    // since is a JS Date — convert to Gmail query format
    const d = new Date(since)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    params.q = `after:${y}/${m}/${day}`
  }

  const listRes = await gmailGet(`/users/${VIRKAR_EMAIL}/messages`, token, params)
  const messages = listRes.messages || []

  const emails = await Promise.all(
    messages.map(async ({ id }) => {
      const msg = await gmailGet(`/users/${VIRKAR_EMAIL}/messages/${id}`, token, { format: 'full' })
      const headers = msg.payload?.headers || []
      const subject = getHeader(headers, 'subject')
      const from = getHeader(headers, 'from')
      const date = getHeader(headers, 'date')

      // Extract sender email from "Name <email@domain.com>" format
      const senderMatch = from.match(/<(.+?)>/)
      const senderEmail = senderMatch ? senderMatch[1] : from

      const body = extractBody(msg.payload)
      // Gmail's snippet is a plain-text preview always available regardless of MIME structure.
      // Prepend it so parsers always have key billing fields even if body extraction misses them.
      const snippet = msg.snippet ? decodeURIComponent(msg.snippet.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c))) : ''
      const fullText = snippet ? `${snippet}\n\n${body}` : body

      return { id, subject, senderEmail, from, date, body: fullText }
    })
  )

  return emails
}
