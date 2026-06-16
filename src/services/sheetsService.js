const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID

export async function getAllBills() {
  throw new Error('Google Sheets not configured. Add VITE_GOOGLE_SHEET_ID to .env')
}

export async function addBill(billData) {
  throw new Error('Not implemented')
}

export async function updateBill(id, updates) {
  throw new Error('Not implemented')
}

export async function getProviders() {
  throw new Error('Not implemented')
}

export async function addProvider(providerData) {
  throw new Error('Not implemented')
}
