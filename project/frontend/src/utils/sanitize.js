// Basic input sanitization utility
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export const sanitizeFormData = (formData) => {
  const sanitized = {}
  for (const [key, value] of Object.entries(formData)) {
    sanitized[key] = typeof value === 'string' ? sanitizeInput(value) : value
  }
  return sanitized
}