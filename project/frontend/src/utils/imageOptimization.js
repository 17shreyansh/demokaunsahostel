// Image optimization utility
export const optimizeImageUrl = (url, width = 400, height = 300, quality = 80) => {
  if (!url) return null
  
  // If it's already optimized or external, return as is
  if (url.includes('?') || url.startsWith('http')) return url
  
  // Add optimization parameters
  return `${url}?w=${width}&h=${height}&q=${quality}&fit=crop`
}

// Preload critical images
export const preloadImage = (src) => {
  if (!src) return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  document.head.appendChild(link)
}