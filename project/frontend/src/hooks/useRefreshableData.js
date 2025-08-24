import { useState, useEffect, useCallback } from 'react'

const globalState = {
  listeners: new Set(),
  
  subscribe(key, callback) {
    const listener = { key, callback }
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  },
  
  invalidate(key) {
    this.listeners.forEach(listener => {
      if (listener.key === key || key === '*') {
        listener.callback()
      }
    })
  }
}

export const useRefreshableData = (key, fetchFn, deps = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      console.error(`Error fetching ${key}:`, err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...deps])

  useEffect(() => {
    return globalState.subscribe(key, fetchData)
  }, [key, fetchData])

  return { data, loading, refetch: fetchData }
}

export const invalidateData = (key) => {
  globalState.invalidate(key)
}

export const invalidateAllData = () => {
  globalState.invalidate('*')
}