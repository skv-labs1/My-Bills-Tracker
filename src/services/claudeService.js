const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY

export async function parseBillEmail(emailContent) {
  // TODO: call Claude API to extract billing data from email
  throw new Error('Claude API key not configured')
}

export async function parseBillPDF(pdfText) {
  // TODO: call Claude API to extract billing data from PDF text
  throw new Error('Claude API key not configured')
}

export async function detectNewProvider(emailMetadata) {
  // TODO: determine if email sender is a new billing provider
  throw new Error('Not implemented')
}
