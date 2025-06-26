/**
 * Safe localStorage utilities
 * 
 * Provides SSR-safe localStorage access with proper error handling
 */

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         'localStorage' in window && 
         window.localStorage !== null
}

/**
 * Safe localStorage getItem
 */
export const getLocalStorageItem = (key: string): string | null => {
  if (!isLocalStorageAvailable()) {
    return null
  }
  
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    console.warn(`localStorage getItem error for key "${key}":`, error)
    return null
  }
}

/**
 * Safe localStorage setItem
 */
export const setLocalStorageItem = (key: string, value: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false
  }
  
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.warn(`localStorage setItem error for key "${key}":`, error)
    return false
  }
}

/**
 * Safe localStorage removeItem
 */
export const removeLocalStorageItem = (key: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false
  }
  
  try {
    window.localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`localStorage removeItem error for key "${key}":`, error)
    return false
  }
}

/**
 * Safe localStorage clear
 */
export const clearLocalStorage = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false
  }
  
  try {
    window.localStorage.clear()
    return true
  } catch (error) {
    console.warn('localStorage clear error:', error)
    return false
  }
}

/**
 * Get JSON from localStorage with safe parsing
 */
export const getLocalStorageJSON = <T = unknown>(key: string): T | null => {
  const item = getLocalStorageItem(key)
  if (!item) {
    return null
  }
  
  try {
    return JSON.parse(item) as T
  } catch (error) {
    console.warn(`localStorage JSON parse error for key "${key}":`, error)
    return null
  }
}

/**
 * Set JSON to localStorage with safe stringification
 */
export const setLocalStorageJSON = (key: string, value: unknown): boolean => {
  try {
    const stringified = JSON.stringify(value)
    return setLocalStorageItem(key, stringified)
  } catch (error) {
    console.warn(`localStorage JSON stringify error for key "${key}":`, error)
    return false
  }
}
