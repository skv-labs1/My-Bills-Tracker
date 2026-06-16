export async function parseBillEmail(_emailContent) {
  throw new Error('Claude API key not configured. Add VITE_CLAUDE_API_KEY to .env')
}

export async function parseBillPDF(_pdfText) {
  throw new Error('Not implemented')
}

export async function detectNewProvider(_emailMetadata) {
  throw new Error('Not implemented')
}
