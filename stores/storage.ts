import { defineStore } from 'pinia'

/**
 * Type for storage change callback
 */
type StorageChangeCallback = (
  key: string, 
  newValue: string | null, 
  oldValue: string | null
) => void

/**
 * Storage Store
 * 
 * Provides SSR-safe localStorage access with Pinia state management
 * This store handles all localStorage operations and provides reactive state
 */
export const useStorageStore = defineStore('storage', () => {
  // Reactive state to track localStorage availability
  const isAvailable = ref<boolean>(false)
  
  // Reactive state to cache values
  const cache = ref<Record<string, string>>({})

  /**
   * Check if localStorage is available
   */
  const checkAvailability = (): boolean => {
    const available = typeof window !== 'undefined' && 
                     'localStorage' in window && 
                     window.localStorage !== null
    
    isAvailable.value = available
    return available
  }

  /**
   * Initialize the store (should be called on client-side)
   */
  const init = () => {
    if (import.meta.client) {
      checkAvailability()
      // Load existing values into cache if needed
      if (isAvailable.value) {
        // This could be expanded to preload specific keys if needed
      }
    }
  }

  /**
   * Safe localStorage getItem with caching
   */
  const getItem = (key: string): string | null => {
    if (!checkAvailability()) {
      return null
    }
    
    try {
      const value = window.localStorage.getItem(key)
      // Update cache
      if (value !== null) {
        cache.value[key] = value
      }
      return value
    } catch (error) {
      console.warn(`localStorage getItem error for key "${key}":`, error)
      return null
    }
  }

  /**
   * Safe localStorage setItem with caching
   */
  const setItem = (key: string, value: string): boolean => {
    if (!checkAvailability()) {
      return false
    }
    
    try {
      window.localStorage.setItem(key, value)
      // Update cache
      cache.value[key] = value
      return true
    } catch (error) {
      console.warn(`localStorage setItem error for key "${key}":`, error)
      return false
    }
  }

  /**
   * Safe localStorage removeItem with cache cleanup
   */
  const removeItem = (key: string): boolean => {
    if (!checkAvailability()) {
      return false
    }
    
    try {
      window.localStorage.removeItem(key)
      // Remove from cache using Vue's delete pattern
      const newCache = { ...cache.value }
      if (key in newCache) {
        const { [key]: removed, ...rest } = newCache
        cache.value = rest
      }
      return true
    } catch (error) {
      console.warn(`localStorage removeItem error for key "${key}":`, error)
      return false
    }
  }

  /**
   * Safe localStorage clear with cache cleanup
   */
  const clear = (): boolean => {
    if (!checkAvailability()) {
      return false
    }
    
    try {
      window.localStorage.clear()
      // Clear cache
      cache.value = {}
      return true
    } catch (error) {
      console.warn('localStorage clear error:', error)
      return false
    }
  }

  /**
   * Get JSON from localStorage with safe parsing
   */
  const getJSON = <T = unknown>(key: string): T | null => {
    const item = getItem(key)
    if (!item) {
      return null
    }
    
    try {
      const parsed = JSON.parse(item) as T
      return parsed
    } catch (error) {
      console.warn(`localStorage JSON parse error for key "${key}":`, error)
      return null
    }
  }

  /**
   * Set JSON to localStorage with safe stringification
   */
  const setJSON = (key: string, value: unknown): boolean => {
    try {
      const stringified = JSON.stringify(value)
      return setItem(key, stringified)
    } catch (error) {
      console.warn(`localStorage JSON stringify error for key "${key}":`, error)
      return false
    }
  }

  /**
   * Get reactive reference to a localStorage value
   * This provides automatic reactivity when the value changes
   */
  const getReactive = <T = string>(key: string, defaultValue?: T) => {
    return computed({
      get: () => {
        const value = getItem(key)
        if (value === null && defaultValue !== undefined) {
          return defaultValue
        }
        return value as T
      },
      set: (newValue: T) => {
        if (newValue === null || newValue === undefined) {
          removeItem(key)
        } else {
          setItem(key, String(newValue))
        }
      }
    })
  }

  /**
   * Get reactive reference to a JSON localStorage value
   */
  const getJSONReactive = <T = unknown>(key: string, defaultValue?: T) => {
    return computed({
      get: () => {
        const value = getJSON<T>(key)
        if (value === null && defaultValue !== undefined) {
          return defaultValue
        }
        return value
      },
      set: (newValue: T) => {
        if (newValue === null || newValue === undefined) {
          removeItem(key)
        } else {
          setJSON(key, newValue)
        }
      }
    })
  }

  /**
   * Watch for changes in localStorage (from other tabs/windows)
   */
  const watchStorage = (callback: StorageChangeCallback) => {
    if (!checkAvailability()) {
      return () => {} // Return empty cleanup function
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage) {
        // Update cache
        if (event.newValue !== null && event.key) {
          cache.value[event.key] = event.newValue
        } else if (event.key) {
          // Remove from cache using Vue's delete pattern
          const newCache = { ...cache.value }
          if (event.key in newCache) {
            const { [event.key]: removed, ...rest } = newCache
            cache.value = rest
          }
        }
        
        callback(event.key || '', event.newValue, event.oldValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }

  return {
    // State
    isAvailable: readonly(isAvailable),
    cache: readonly(cache),
    
    // Methods
    init,
    checkAvailability,
    getItem,
    setItem,
    removeItem,
    clear,
    getJSON,
    setJSON,
    getReactive,
    getJSONReactive,
    watchStorage
  }
})
