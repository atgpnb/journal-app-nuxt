/**
 * Authentication Plugin
 * 
 * Initializes the authentication system and provides global configurations
 */

import { AUTH_CONFIG } from '~/constants/auth'

export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (!import.meta.client) return

  // Validate environment configuration
  const config = useRuntimeConfig()
  
  if (!config.public.apiBaseUrl) {
    console.warn('⚠️ API base URL not configured. Using default:', AUTH_CONFIG.DEFAULT_API_BASE_URL)
  }

  // Initialize auth state management
  try {
    // Check for existing auth data
    const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    const userStr = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER)
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        console.log('🔐 Found existing authentication for user:', user.username)
        
        // Update last activity
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
      } catch {
        console.warn('⚠️ Invalid stored user data, clearing...')
        // Clear invalid data
        Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key)
        })
      }
    }
  } catch (error) {
    console.error('❌ Error initializing auth plugin:', error)
  }

  // Set up global error handlers for authentication
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const error = event.reason
      if (error instanceof Error) {
        const errorData = JSON.parse(error.message)
        
        // Handle authentication errors globally
        if (errorData.status === AUTH_CONFIG.HTTP_STATUS.UNAUTHORIZED) {
          console.warn('🔒 Unauthorized request detected, redirecting to login...')
          
          // Clear auth data
          Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key)
          })
          
          // Redirect to login if not already there
          if (window.location.pathname !== AUTH_CONFIG.ROUTES.LOGIN) {
            window.location.href = AUTH_CONFIG.ROUTES.LOGIN
          }
        }
      }
    } catch {
      // Ignore parsing errors
    }
  })

  // Set up activity tracking
  let activityTimer: ReturnType<typeof setTimeout> | null = null
  
  const updateActivity = () => {
    const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    if (token) {
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
    }
    
    // Clear existing timer
    if (activityTimer) {
      clearTimeout(activityTimer)
    }
    
    // Set new timer for session timeout
    activityTimer = setTimeout(() => {
      const lastActivity = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY)
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity)
        
        if (timeSinceActivity > AUTH_CONFIG.SESSION.TIMEOUT) {
          console.warn('⏰ Session expired due to inactivity')
          
          // Clear auth data
          Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key)
          })
          
          // Redirect to login
          if (window.location.pathname !== AUTH_CONFIG.ROUTES.LOGIN) {
            window.location.href = AUTH_CONFIG.ROUTES.LOGIN
          }
        }
      }
    }, AUTH_CONFIG.SESSION.ACTIVITY_CHECK_INTERVAL)
  }

  // Listen for user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  
  activityEvents.forEach(event => {
    document.addEventListener(event, updateActivity, true)
  })

  // Set up periodic session check
  const sessionCheckInterval = setInterval(() => {
    const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    const lastActivity = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY)
    
    if (token && lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity)
      
      if (timeSinceActivity > AUTH_CONFIG.SESSION.TIMEOUT) {
        console.warn('⏰ Session expired during periodic check')
        
        // Clear auth data
        Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key)
        })
        
        // Clear interval
        clearInterval(sessionCheckInterval)
        
        // Redirect to login
        if (window.location.pathname !== AUTH_CONFIG.ROUTES.LOGIN) {
          window.location.href = AUTH_CONFIG.ROUTES.LOGIN
        }
      }
    } else if (!token) {
      // No token, clear interval
      clearInterval(sessionCheckInterval)
    }
  }, AUTH_CONFIG.SESSION.ACTIVITY_CHECK_INTERVAL)

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (activityTimer) {
      clearTimeout(activityTimer)
    }
    clearInterval(sessionCheckInterval)
    
    activityEvents.forEach(event => {
      document.removeEventListener(event, updateActivity, true)
    })
  })

  console.log('🚀 Authentication plugin initialized')
})
