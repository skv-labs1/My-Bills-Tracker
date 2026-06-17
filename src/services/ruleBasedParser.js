// Rule-based bill parser for known Canadian providers.
// Returns a structured bill object or null if the provider is unrecognised.

const PROVIDER_RULES = [
  // --- Telecom ---
  {
    provider: 'Rogers',
    category: 'Telecom',
    domains: ['rogers.com', 'rogershelp.com'],
    subjectPatterns: [/rogers/i],
    amountRegex: /(?:amount due|total due|balance due|payment due|total amount|your bill|pay now|owing)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|payment due|due by|due on|pay by|pay before)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  },
  {
    provider: 'Bell',
    category: 'Telecom',
    domains: ['bell.ca', 'bell.net', 'bellmts.ca'],
    subjectPatterns: [/bell\s+(canada|mobility|internet|tv)/i, /^bell\s/i],
    amountRegex: /(?:amount due|total due|balance due|new charges)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|payment due|due by)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Telus',
    category: 'Telecom',
    domains: ['telus.com', 'telushealth.com'],
    subjectPatterns: [/telus/i],
    amountRegex: /(?:amount due|total due|balance)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due on|payment due)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Freedom Mobile',
    category: 'Telecom',
    domains: ['freedommobile.ca'],
    subjectPatterns: [/freedom mobile/i],
    amountRegex: /(?:amount due|total due)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due by)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Public Mobile',
    category: 'Telecom',
    domains: ['publicmobile.ca'],
    subjectPatterns: [/public mobile/i],
    amountRegex: /(?:amount|total|charged)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:renewal date|due date|due on)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },

  // --- Internet ---
  {
    provider: 'TekSavvy',
    category: 'Internet',
    domains: ['teksavvy.com'],
    subjectPatterns: [/teksavvy/i],
    amountRegex: /(?:amount due|total|invoice total)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due on)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Beanfield',
    category: 'Internet',
    domains: ['beanfield.com'],
    subjectPatterns: [/beanfield/i],
    amountRegex: /(?:amount due|total)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due on)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },

  // --- Utilities ---
  {
    provider: 'Enbridge',
    category: 'Utilities',
    domains: ['enbridge.com', 'enbridgegas.com'],
    subjectPatterns: [/enbridge/i],
    amountRegex: /(?:amount due|total amount due|current charges|total due)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|payment due|due by)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Hydro One',
    category: 'Utilities',
    domains: ['hydroone.com'],
    subjectPatterns: [/hydro one/i],
    amountRegex: /(?:amount due|total amount|please pay)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|payment due|due by)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Toronto Hydro',
    category: 'Utilities',
    domains: ['torontohydro.com'],
    subjectPatterns: [/toronto hydro/i],
    amountRegex: /(?:amount due|total due|balance due)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due by|payment due)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Alectra',
    category: 'Utilities',
    domains: ['alectra.com'],
    subjectPatterns: [/alectra/i],
    amountRegex: /(?:amount due|total due)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due by)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },

  // --- Streaming ---
  {
    provider: 'Netflix',
    category: 'Streaming',
    domains: ['netflix.com'],
    subjectPatterns: [/netflix/i],
    amountRegex: /(?:charged|amount|total|billed)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:next billing date|renewal date|next charge)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Spotify',
    category: 'Streaming',
    domains: ['spotify.com'],
    subjectPatterns: [/spotify/i],
    amountRegex: /(?:charged|amount|total|payment)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:next billing date|renewal|next payment)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Disney+',
    category: 'Streaming',
    domains: ['disneyplus.com', 'disney.com'],
    subjectPatterns: [/disney\+/i, /disney plus/i],
    amountRegex: /(?:charged|amount|total|billed)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:next billing|renewal|next charge)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Crave',
    category: 'Streaming',
    domains: ['crave.ca', 'cravetv.ca'],
    subjectPatterns: [/crave/i],
    amountRegex: /(?:charged|amount|total)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:next billing|renewal)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Amazon Prime',
    category: 'Streaming',
    domains: ['amazon.ca', 'amazon.com'],
    subjectPatterns: [/amazon prime/i, /prime video/i, /prime membership/i],
    amountRegex: /(?:charged|amount|total|billed)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:next billing|renewal|next charge)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Apple Music',
    category: 'Streaming',
    domains: ['apple.com'],
    subjectPatterns: [/apple music/i, /apple one/i],
    amountRegex: /(?:billed|charged|amount|total)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:next billing|renewal)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'YouTube Premium',
    category: 'Streaming',
    domains: ['google.com', 'youtube.com'],
    subjectPatterns: [/youtube premium/i],
    amountRegex: /(?:charged|amount|total)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:next billing|renewal)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },

  // --- Insurance ---
  {
    provider: 'Intact',
    category: 'Insurance',
    domains: ['intact.net', 'intact.ca'],
    subjectPatterns: [/intact insurance/i, /\bintact\b/i],
    amountRegex: /(?:premium|amount due|total due|payment)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|payment due|due on)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Aviva',
    category: 'Insurance',
    domains: ['aviva.ca'],
    subjectPatterns: [/aviva/i],
    amountRegex: /(?:premium|amount due|total)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due by)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Sonnet',
    category: 'Insurance',
    domains: ['sonnet.ca'],
    subjectPatterns: [/sonnet insurance/i, /\bsonnet\b/i],
    amountRegex: /(?:premium|amount|total)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due on)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
  {
    provider: 'Belairdirect',
    category: 'Insurance',
    domains: ['belairdirect.com'],
    subjectPatterns: [/belairdirect/i],
    amountRegex: /(?:premium|amount due|total)[^\d$]*\$?([\d,]+\.?\d{0,2})/i,
    dueDateRegex: /(?:due date|due by)[^\d]*(\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i,
  },
]

function parseDateString(raw) {
  if (!raw) return null
  // Try ISO first
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim()
  const d = new Date(raw.replace(',', ''))
  if (!isNaN(d)) return d.toISOString().split('T')[0]
  return null
}

function parseAmount(raw) {
  if (!raw) return null
  return parseFloat(raw.replace(/,/g, ''))
}

function matchRule(emailContent, senderDomain, subject) {
  const domain = (senderDomain || '').toLowerCase()
  const subj = (subject || '').toLowerCase()
  // For forwarded emails the sender domain won't match — also check body
  const bodySnippet = (emailContent || '').slice(0, 4000)

  for (const rule of PROVIDER_RULES) {
    const domainMatch = rule.domains.some(d => domain.includes(d))
    const subjectMatch = rule.subjectPatterns.some(p => p.test(subj))
    const bodyMatch = rule.subjectPatterns.some(p => p.test(bodySnippet))

    if (domainMatch || subjectMatch || bodyMatch) {
      const amountMatch = rule.amountRegex.exec(emailContent)
      const dueDateMatch = rule.dueDateRegex.exec(emailContent)

      const amount = amountMatch ? parseAmount(amountMatch[1]) : null
      const dueDate = dueDateMatch ? parseDateString(dueDateMatch[1]) : null

      return {
        provider: rule.provider,
        category: rule.category,
        amount,
        due_date: dueDate,
        confidence: amount ? 'HIGH' : 'MEDIUM',
        parsed_by: 'rule',
      }
    }
  }

  return null
}

/**
 * Main entry point.
 * Returns parsed bill data or null if provider is unrecognised.
 */
export function parseEmailWithRules({ body, subject, senderEmail }) {
  const senderDomain = senderEmail?.split('@')[1] || ''
  return matchRule(body || '', senderDomain, subject || '')
}

export function getSupportedDomains() {
  return PROVIDER_RULES.flatMap(r => r.domains)
}
