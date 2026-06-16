export async function connectGmail() {
  // TODO: implement Google OAuth flow
  throw new Error('Gmail integration not yet configured. Add VITE_GOOGLE_CLIENT_ID to .env')
}

export async function fetchBillEmails(since) {
  // TODO: fetch emails with label specified by VITE_GMAIL_BILLS_LABEL
  throw new Error('Not implemented')
}

export async function getAttachment(messageId, attachmentId) {
  // TODO: fetch attachment buffer from Gmail API
  throw new Error('Not implemented')
}
