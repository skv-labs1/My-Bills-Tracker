export async function connectGmail() {
  throw new Error('Gmail integration not yet configured. Add VITE_GOOGLE_CLIENT_ID to .env')
}

export async function fetchBillEmails(_since) {
  throw new Error('Not implemented')
}

export async function getAttachment(_messageId, _attachmentId) {
  throw new Error('Not implemented')
}
