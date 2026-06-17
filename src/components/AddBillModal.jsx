import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { CATEGORIES } from '../utils/categoryMapper.js'

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Bank Transfer', 'Pre-authorized', 'Other']

export default function AddBillModal({ onClose }) {
  const { providers, addBill } = useBills()

  const providerNames = [
    ...new Set(providers.map(p => p.provider_name).filter(Boolean)),
    'Other',
  ]

  const [form, setForm] = useState({
    provider: '',
    customProvider: '',
    category: 'Utilities',
    amount: '',
    due_date: '',
    payment_method: 'Credit Card',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    const providerVal = form.provider === 'Other' ? form.customProvider.trim() : form.provider
    if (!providerVal) e.provider = 'Provider is required'
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) e.amount = 'Valid amount is required'
    if (!form.due_date) e.due_date = 'Due date is required'
    return e
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    const providerName = form.provider === 'Other' ? form.customProvider.trim() : form.provider
    const amt = parseFloat(form.amount)

    // Look up baseline from providers list to compute variance
    const providerRecord = providers.find(p => p.provider_name === providerName)
    const expected = providerRecord?.baseline_amount || amt
    const variance_pct = expected ? ((amt - expected) / expected * 100) : 0

    await addBill({
      provider: providerName,
      category: form.category,
      amount: amt,
      expected,
      variance_pct: parseFloat(variance_pct.toFixed(2)),
      due_date: form.due_date,
      status: new Date(form.due_date) < new Date() ? 'paid' : 'upcoming',
      flagged: false,
      flag_reason: '',
      parsed_by: 'manual',
      confidence: 'HIGH',
      needs_review: false,
      email_id: '',
      payment_method: form.payment_method,
      notes: form.notes,
    })
    setSaving(false)
    onClose()
  }

  const inputClass = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400'
  const errorClass = 'text-xs text-red-500 mt-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add Bill Manually</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          {/* Provider */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Provider *</label>
            <select value={form.provider} onChange={e => set('provider', e.target.value)} className={inputClass}>
              <option value="">Select provider…</option>
              {providerNames.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.provider && <p className={errorClass}>{errors.provider}</p>}
          </div>

          {form.provider === 'Other' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Provider Name *</label>
              <input
                type="text"
                placeholder="e.g. Costco Membership"
                value={form.customProvider}
                onChange={e => set('customProvider', e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount (CAD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                className={inputClass}
              />
              {errors.amount && <p className={errorClass}>{errors.amount}</p>}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Due Date *</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
                className={inputClass}
              />
              {errors.due_date && <p className={errorClass}>{errors.due_date}</p>}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Payment Method</label>
            <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)} className={inputClass}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Optional note…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Bill'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
