// ─── Configuration ────────────────────────────────────────────────────────────
var GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'
var SHEET_ID       = 'YOUR_GOOGLE_SHEET_ID_HERE'

var BILLS_SHEET    = 'bills'
var GMAIL_LABEL    = 'bill-emails'  // Custom label — 'Bills' is reserved by Gmail
var MAX_EMAILS     = 50        // Emails to process per run

// ─── Column definition (must match the web app's sheetsService.js) ────────────
var COLUMNS = [
  'id', 'provider', 'category', 'amount', 'expected', 'variance_pct',
  'due_date', 'status', 'flagged', 'flag_reason', 'parsed_by', 'confidence',
  'needs_review', 'email_id', 'synced_at',
  'billing_period_start', 'billing_period_end', 'account_number',
  'payment_method', 'notes'
]

// ─── Main entry point ─────────────────────────────────────────────────────────
function parseBills() {
  var sheet = getOrCreateSheet()
  var existingEmailIds = getExistingEmailIds(sheet)

  var threads = GMAIL_LABEL
    ? GmailApp.getUserLabelByName(GMAIL_LABEL).getThreads(0, MAX_EMAILS)
    : GmailApp.getInboxThreads(0, MAX_EMAILS)

  var newRows = []

  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages()
    for (var j = 0; j < messages.length; j++) {
      var msg = messages[j]
      var emailId = msg.getId()

      if (existingEmailIds[emailId]) continue

      var subject  = msg.getSubject()
      var from     = msg.getFrom()
      var dateObj  = msg.getDate()
      var body     = msg.getPlainBody() || msg.getBody().replace(/<[^>]+>/g, ' ')

      var parsed = callGemini(subject, from, body, dateObj)
      if (!parsed) continue
      if (parsed.confidence === 'LOW') continue

      var dueDate  = parsed.due_date || Utilities.formatDate(dateObj, 'America/Toronto', 'yyyy-MM-dd')
      var isPast   = dueDate && new Date(dueDate) < new Date()

      var row = buildRow({
        id:                   'email_' + emailId,
        provider:             parsed.provider    || 'Unknown',
        category:             parsed.category    || 'Other',
        amount:               parsed.amount      || 0,
        expected:             parsed.amount      || 0,
        variance_pct:         0,
        due_date:             dueDate,
        status:               isPast ? 'paid' : 'upcoming',
        flagged:              false,
        flag_reason:          '',
        parsed_by:            'gemini',
        confidence:           parsed.confidence  || 'MEDIUM',
        needs_review:         parsed.confidence !== 'HIGH',
        email_id:             emailId,
        synced_at:            new Date().toISOString(),
        billing_period_start: parsed.billing_period_start || '',
        billing_period_end:   parsed.billing_period_end   || '',
        account_number:       parsed.account_number       || '',
        payment_method:       '',
        notes:                '',
      })

      newRows.push(row)
      existingEmailIds[emailId] = true
    }
  }

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, COLUMNS.length)
      .setValues(newRows)
    Logger.log('Added ' + newRows.length + ' new bills.')
  } else {
    Logger.log('No new bills found.')
  }
}

// ─── Gemini API call ──────────────────────────────────────────────────────────
function callGemini(subject, from, body, emailDate) {
  var prompt = [
    'You are a billing email parser. Extract structured bill data from the email below.',
    'Return ONLY a valid JSON object with these exact keys:',
    '  provider (string), category (one of: Telecom, Internet, Utilities, Streaming, Insurance, Kids, Other),',
    '  amount (number or null), due_date (YYYY-MM-DD or null),',
    '  billing_period_start (YYYY-MM-DD or null), billing_period_end (YYYY-MM-DD or null),',
    '  account_number (string or null), confidence (HIGH, MEDIUM, or LOW).',
    'Set confidence=LOW if this does not appear to be a billing/payment email.',
    'Set confidence=HIGH if you found both amount and due_date.',
    'Set confidence=MEDIUM if you found amount but not due_date.',
    '',
    'Email date: ' + emailDate,
    'From: ' + from,
    'Subject: ' + subject,
    'Body:',
    body.substring(0, 4000),
  ].join('\n')

  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY

  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 512 }
  }

  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    })

    var data = JSON.parse(response.getContentText())
    var text = data.candidates && data.candidates[0].content.parts[0].text

    // Strip markdown code fences if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (e) {
    Logger.log('Gemini error for email "' + subject + '": ' + e.message)
    return null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOrCreateSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(BILLS_SHEET)
  if (!sheet) {
    sheet = ss.insertSheet(BILLS_SHEET)
    sheet.appendRow(COLUMNS)
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS)
  }
  return sheet
}

function getExistingEmailIds(sheet) {
  var ids = {}
  if (sheet.getLastRow() < 2) return ids
  var emailIdCol = COLUMNS.indexOf('email_id') + 1
  var values = sheet.getRange(2, emailIdCol, sheet.getLastRow() - 1, 1).getValues()
  values.forEach(function(row) { if (row[0]) ids[row[0]] = true })
  return ids
}

function buildRow(data) {
  return COLUMNS.map(function(col) {
    var v = data[col]
    return v === undefined ? '' : v
  })
}

// ─── Trigger setup ────────────────────────────────────────────────────────────
function createHourlyTrigger() {
  // Delete any existing parseBills triggers first to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'parseBills') {
      ScriptApp.deleteTrigger(t)
    }
  })
  ScriptApp.newTrigger('parseBills')
    .timeBased()
    .everyHours(1)
    .create()
  Logger.log('Hourly trigger created for parseBills()')
}

function deleteTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    ScriptApp.deleteTrigger(t)
  })
  Logger.log('All triggers deleted.')
}
