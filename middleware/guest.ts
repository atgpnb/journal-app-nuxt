import { AUTH_CONFIG } from '~/constants/auth'

/**
 * Guest Middleware
 * 
 * Protects routes that should only be accessible to non-authenticated users.
 * Redirects to dashboard if user is already authenticated.
 * SSR-safe and handles cookie-based authentication.
 */
export default defineNuxtRouteMiddleware((_to, _from) => {
  // Get auth token and user from cookies (works on both server and client)
  const authToken = useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
  const authUser = useCookie(AUTH_CONFIG.STORAGE_KEYS.USER)
  
  // If user is authenticated, redirect to dashboard
  if (authToken.value && authUser.value) {
    try {
      if (typeof authUser.value === 'string') {
        const userData = JSON.parse(authUser.value)
        
        // Validate user data structure
        if (userData && userData.id && userData.email) {
          return navigateTo(AUTH_CONFIG.ROUTES.DASHBOARD)
        }
      }
    } catch {
      // Invalid user data, clear cookies and allow access to guest route
      authToken.value = null
      authUser.value = null
      
      // Also clear client-side storage
      if (import.meta.client && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
          window.localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER)
          window.localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY)
        } catch (error) {
          console.warn('localStorage error in guest middleware:', error)
        }
      }
    }
  }
})
