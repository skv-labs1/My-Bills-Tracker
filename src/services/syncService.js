import { fetchBillEmails } from './gmailService.js'
import { parseBillEmail } from './geminiService.js'
import { addBillsToSheet, getAllBills } from './sheetsService.js'
import { isPastDue } from '../utils/dateHelpers.js'

/**
 * Full sync:
 * 1. Fetch emails from virkar inbox
 * 2. Parse each with rule-based parser (Claude fallback if key set)
 * 3. Skip emails already saved (dedup by email_id)
 * 4. Append new bills to Google Sheet
 * Returns { added, skipped, needsReview }
 */
export async function syncEmails(token, { since = null } = {}) {
  // Fetch existing bills to avoid duplicates
  const existing = await getAllBills(token)
  const existingEmailIds = new Set(existing.map(b => b.email_id).filter(Boolean))

  // Fetch emails from virkar inbox
  const emails = await fetchBillEmails(token, { since, maxResults: 200 })

  const newBills = []
  let skipped = 0

  for (const email of emails) {
    if (existingEmailIds.has(email.id)) {
      skipped++
      continue
    }

    const parsed = await parseBillEmail({
      body: email.body,
      subject: email.subject,
      senderEmail: email.senderEmail,
    })

    if (!parsed) {
      skipped++
      continue
    }

    // Fall back to email received date when provider doesn't include a due date
    const emailDate = email.date ? new Date(email.date) : null
    const emailDateISO = emailDate && !isNaN(emailDate)
      ? `${emailDate.getFullYear()}-${String(emailDate.getMonth()+1).padStart(2,'0')}-${String(emailDate.getDate()).padStart(2,'0')}`
      : new Date().toISOString().split('T')[0]
    const dueDate = parsed.due_date || emailDateISO

    const bill = {
      id: `email_${email.id}`,
      provider: parsed.provider || 'Unknown',
      category: parsed.category || 'Other',
      amount: parsed.amount || 0,
      expected: parsed.amount || 0,
      variance_pct: 0,
      due_date: dueDate,
      status: isPastDue(dueDate) ? 'paid' : 'upcoming',
      flagged: false,
      flag_reason: '',
      parsed_by: parsed.parsed_by || 'none',
      confidence: parsed.confidence || 'LOW',
      needs_review: parsed.needs_review || !parsed.amount,
      email_id: email.id,
      synced_at: new Date().toISOString(),
    }

    newBills.push(bill)
  }

  if (newBills.length) {
    await addBillsToSheet(token, newBills)
  }

  const needsReview = newBills.filter(b => b.needs_review).length

  return {
    added: newBills.length,
    skipped,
    needsReview,
    bills: newBills,
  }
}
