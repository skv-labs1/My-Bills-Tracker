export async function getAllBills() {
  throw new Error('Google Sheets not configured. Add VITE_GOOGLE_SHEET_ID to .env')
}

export async function addBill(_billData) {
  throw new Error('Not implemented')
}

export async function updateBill(_id, _updates) {
  throw new Error('Not implemented')
}

export async function getProviders() {
  throw new Error('Not implemented')
}

export async function addProvider(_providerData) {
  throw new Error('Not implemented')
}
