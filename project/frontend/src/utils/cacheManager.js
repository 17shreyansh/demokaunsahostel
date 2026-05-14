// Centralized cache management
class CacheManager {
  constructor() {
    this.caches = new Map()
  }

  // Register a cache instance
  register(name, cacheInstance) {
    this.caches.set(name, cacheInstance)
  }

  // Clear all registered caches
  clearAll() {
    console.log('Clearing all caches...')
    this.caches.forEach((cache, name) => {
      console.log(`Clearing cache: ${name}`)
      if (cache && typeof cache.clear === 'function') {
        cache.clear()
      }
    })
  }

  // Clear specific cache
  clear(name) {
    const cache = this.caches.get(name)
    if (cache && typeof cache.clear === 'function') {
      console.log(`Clearing cache: ${name}`)
      cache.clear()
    }
  }
}

export const cacheManager = new CacheManager()

// Helper function to force refresh data
export const forceRefresh = () => {
  cacheManager.clearAll()
  // Also clear browser cache for API calls
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('api') || name.includes('hostels')) {
          caches.delete(name)
        }
      })
    })
  }
}