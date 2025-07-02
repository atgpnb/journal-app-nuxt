import { defineStore } from 'pinia'
import type { User } from '~/types/auth'
import { AUTH_CONFIG } from '~/constants/auth'
import { useStorageStore } from './storage'

/**
 * Auth Store
 * 
 * Manages authentication state using Pinia with persistent storage
 * Provides reactive authentication state and localStorage persistence
 */
export const useAuthStore = defineStore('auth', () => {
  const storageStore = useStorageStore()
  
  // Reactive authentication state
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const lastActivity = ref<number | null>(null)
  const isAuthenticated = ref<boolean>(false)
  const isLoading = ref<boolean>(false)

  // Computed properties
  const isTokenExpired = computed(() => {
    if (!lastActivity.value) return true
    
    const now = Date.now()
    const timeDiff = now - lastActivity.value
    return timeDiff > AUTH_CONFIG.SESSION.TIMEOUT
  })

  const shouldRefreshToken = computed(() => {
    if (!lastActivity.value) return false
    
    const now = Date.now()
    const timeDiff = now - lastActivity.value
    const remainingTime = AUTH_CONFIG.SESSION.TIMEOUT - timeDiff
    return remainingTime <= AUTH_CONFIG.SESSION.REFRESH_THRESHOLD
  })

  /**
   * Initialize auth state from localStorage
   */
  const initAuthState = () => {
    if (import.meta.client) {
      storageStore.init()
      loadAuthState()
    }
  }

  /**
   * Load authentication state from localStorage
   */
  const loadAuthState = () => {
    const storedToken = storageStore.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    const storedUser = storageStore.getJSON<User>(AUTH_CONFIG.STORAGE_KEYS.USER)
    const storedActivity = storageStore.getItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY)

    if (storedToken && storedUser && storedActivity) {
      const activityTime = parseInt(storedActivity, 10)
      const now = Date.now()
      const timeDiff = now - activityTime

      // Check if session is still valid
      if (timeDiff <= AUTH_CONFIG.SESSION.TIMEOUT) {
        token.value = storedToken
        user.value = storedUser
        lastActivity.value = activityTime
        isAuthenticated.value = true
      } else {
        // Session expired, clear auth state
        clearAuthState()
      }
    }
  }

  /**
   * Set authentication data and persist to localStorage
   */
  const setAuthData = (authToken: string, userData: User) => {
    const now = Date.now()
    
    // Update reactive state
    token.value = authToken
    user.value = userData
    lastActivity.value = now
    isAuthenticated.value = true

    // Persist to localStorage
    storageStore.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, authToken)
    storageStore.setJSON(AUTH_CONFIG.STORAGE_KEYS.USER, userData)
    storageStore.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString())
  }

  /**
   * Update user data and persist to localStorage
   */
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      storageStore.setJSON(AUTH_CONFIG.STORAGE_KEYS.USER, user.value)
    }
  }

  /**
   * Update last activity timestamp
   */
  const updateLastActivity = () => {
    const now = Date.now()
    lastActivity.value = now
    storageStore.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString())
  }

  /**
   * Clear authentication state and localStorage
   */
  const clearAuthState = () => {
    // Clear reactive state
    token.value = null
    user.value = null
    lastActivity.value = null
    isAuthenticated.value = false

    // Clear localStorage
    storageStore.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    storageStore.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER)
    storageStore.removeItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY)
  }

  /**
   * Set loading state
   */
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  /**
   * Get current token (with expiry check)
   */
  const getValidToken = (): string | null => {
    if (!token.value || isTokenExpired.value) {
      clearAuthState()
      return null
    }
    return token.value
  }

  /**
   * Check if current session is valid
   */
  const isSessionValid = (): boolean => {
    return isAuthenticated.value && !isTokenExpired.value && !!token.value
  }

  /**
   * Reactive getters for localStorage values
   * These provide automatic reactivity when localStorage changes
   */
  const tokenReactive = computed({
    get: () => token.value,
    set: (value: string | null) => {
      if (value) {
        storageStore.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, value)
        token.value = value
      } else {
        storageStore.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
        token.value = null
      }
    }
  })

  const userReactive = computed({
    get: () => user.value,
    set: (value: User | null) => {
      if (value) {
        storageStore.setJSON(AUTH_CONFIG.STORAGE_KEYS.USER, value)
        user.value = value
      } else {
        storageStore.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER)
        user.value = null
      }
    }
  })

  /**
   * Watch for localStorage changes from other tabs
   */
  const watchAuthChanges = () => {
    return storageStore.watchStorage((key, newValue, _oldValue) => {
      // Handle auth-related localStorage changes
      switch (key) {
        case AUTH_CONFIG.STORAGE_KEYS.TOKEN:
          if (newValue !== token.value) {
            token.value = newValue
            if (!newValue) {
              clearAuthState()
            }
          }
          break
        
        case AUTH_CONFIG.STORAGE_KEYS.USER:
          if (newValue) {
            try {
              const userData = JSON.parse(newValue) as User
              if (JSON.stringify(userData) !== JSON.stringify(user.value)) {
                user.value = userData
              }
            } catch (error) {
              console.warn('Failed to parse user data from localStorage:', error)
            }
          } else {
            user.value = null
          }
          break
        
        case AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY:
          if (newValue) {
            const activityTime = parseInt(newValue, 10)
            if (activityTime !== lastActivity.value) {
              lastActivity.value = activityTime
            }
          } else {
            lastActivity.value = null
          }
          break
      }
      
      // Update authentication status based on current state
      isAuthenticated.value = !!(token.value && user.value && lastActivity.value && !isTokenExpired.value)
    })
  }

  /**
   * Logout and clear all auth data
   */
  const logout = () => {
    clearAuthState()
  }

  return {
    // State
    token: readonly(token),
    user: readonly(user),
    lastActivity: readonly(lastActivity),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    
    // Computed
    isTokenExpired,
    shouldRefreshToken,
    tokenReactive,
    userReactive,
    
    // Methods
    initAuthState,
    loadAuthState,
    setAuthData,
    updateUser,
    updateLastActivity,
    clearAuthState,
    setLoading,
    getValidToken,
    isSessionValid,
    watchAuthChanges,
    logout
  }
})
