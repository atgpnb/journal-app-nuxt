import { AUTH_CONFIG } from '~/constants/auth'

/**
 * Authentication Middleware
 * 
 * Protects routes that require authentication. 
 * Redirects to login if user is not authenticated or session is invalid.
 * SSR-safe and handles cookie-based authentication.
 */
export default defineNuxtRouteMiddleware((_to, _from) => {
  // Get auth token and user from cookies (works on both server and client)
  const authToken = useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
  const authUser = useCookie(AUTH_CONFIG.STORAGE_KEYS.USER)
  
  console.log('Auth middleware check:', {
    hasToken: !!authToken.value,
    hasUser: !!authUser.value,
    route: _to.path,
    isClient: import.meta.client
  })
  
  // If no token or user data, redirect to login
  if (!authToken.value || !authUser.value) {
    console.log('Auth middleware: redirecting to login - missing token or user')
    return navigateTo(AUTH_CONFIG.ROUTES.LOGIN)
  }
  
  // Validate user data format
  try {
    if (typeof authUser.value === 'string') {
      const userData = JSON.parse(authUser.value)
      
      // Basic validation of user object structure
      if (!userData || !userData.id || !userData.email) {
        throw new Error('Invalid user data structure')
      }
    }
  } catch {
    // Invalid user data, clear cookies and redirect
    authToken.value = null
    authUser.value = null
    return navigateTo(AUTH_CONFIG.ROUTES.LOGIN)
  }
  
  // Additional client-side session checks
  if (import.meta.client && typeof window !== 'undefined' && window.localStorage) {
    try {
      // Check if session has expired based on last activity
      const lastActivityStr = window.localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY)
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr)
        const now = Date.now()
        const timeSinceActivity = now - lastActivity
        
        // If session has expired, clear data and redirect
        if (timeSinceActivity > AUTH_CONFIG.SESSION.TIMEOUT) {
          authToken.value = null
          authUser.value = null
          window.localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
          window.localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER)
          window.localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY)
          
          return navigateTo(AUTH_CONFIG.ROUTES.LOGIN)
        }
        
        // Update last activity for continued session
        window.localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString())
      }
    } catch (error) {
      // Handle localStorage errors gracefully (e.g., quota exceeded, disabled)
      console.warn('localStorage error in auth middleware:', error)
    }
  }
})
