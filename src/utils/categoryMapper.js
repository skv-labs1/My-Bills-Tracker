const CATEGORY_COLORS = {
  Telecom: '#3b82f6',
  Internet: '#8b5cf6',
  Utilities: '#f59e0b',
  Streaming: '#10b981',
  Insurance: '#ef4444',
  Other: '#6b7280',
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
}

export const CATEGORIES = Object.keys(CATEGORY_COLORS)
