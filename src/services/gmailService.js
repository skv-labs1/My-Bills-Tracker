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

function extractBody(payload) {
  if (!payload) return ''

  // Single-part plain text
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64(payload.body.data)
  }

  // Multipart — prefer text/plain, fall back to text/html stripped of tags
  if (payload.parts) {
    const plain = payload.parts.find(p => p.mimeType === 'text/plain')
    if (plain?.body?.data) return decodeBase64(plain.body.data)

    const html = payload.parts.find(p => p.mimeType === 'text/html')
    if (html?.body?.data) {
      const raw = decodeBase64(html.body.data)
      return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }

    // Nested multipart
    for (const part of payload.parts) {
      const nested = extractBody(part)
      if (nested) return nested
    }
  }

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

      return { id, subject, senderEmail, from, date, body }
    })
  )

  return emails
}
