class StateManager {
  constructor() {
    this.listeners = new Map()
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key).add(callback)
    
    return () => {
      const callbacks = this.listeners.get(key)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  notify(key) {
    const callbacks = this.listeners.get(key)
    if (callbacks) {
      callbacks.forEach(callback => callback())
    }
  }

  invalidate(key) {
    if (key === '*') {
      this.listeners.forEach((_, k) => this.notify(k))
    } else {
      this.notify(key)
    }
  }
}

export const stateManager = new StateManager()

export const invalidateData = (key = '*') => {
  stateManager.invalidate(key)
}