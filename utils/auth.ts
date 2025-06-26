import { AUTH_CONFIG } from '~/constants/auth'
import type { AuthError, FormValidationResult, FormFieldError } from '~/types/auth'

/**
 * Authentication Utilities
 * 
 * Common helper functions for authentication-related operations
 */

/**
 * Parse and format authentication errors
 */
export const parseAuthError = (error: Error | string): {
  message: string
  fieldErrors: FormFieldError[]
  statusCode?: number
} => {
  try {
    const errorStr = typeof error === 'string' ? error : error.message
    const errorData: AuthError = JSON.parse(errorStr)
    
    const fieldErrors: FormFieldError[] = []
    
    if (errorData.errors) {
      Object.entries(errorData.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach(message => {
            fieldErrors.push({ field, message })
          })
        }
      })
    }
    
    return {
      message: errorData.message || AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR,
      fieldErrors,
      statusCode: errorData.status
    }
  } catch {
    return {
      message: typeof error === 'string' ? error : error.message || AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR,
      fieldErrors: []
    }
  }
}

/**
 * Format user-friendly error messages based on status codes
 */
export const getErrorMessage = (error: Error | string, fallback?: string): string => {
  const parsed = parseAuthError(error)
  
  // Map specific status codes to user-friendly messages
  switch (parsed.statusCode) {
    case AUTH_CONFIG.HTTP_STATUS.UNAUTHORIZED:
      return AUTH_CONFIG.MESSAGES.UNAUTHORIZED
    case AUTH_CONFIG.HTTP_STATUS.TOO_MANY_REQUESTS:
      return AUTH_CONFIG.MESSAGES.RATE_LIMIT_EXCEEDED
    case AUTH_CONFIG.HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return parsed.message
    case 0: // Network error
      return AUTH_CONFIG.MESSAGES.NETWORK_ERROR
    default:
      return parsed.message || fallback || AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR
  }
}

/**
 * Validate form data with custom rules
 */
export const validateFormData = (
  data: Record<string, unknown>,
  rules: Record<string, (value: unknown) => string | null>
): FormValidationResult => {
  const errors: FormFieldError[] = []
  
  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(data[field])
    if (error) {
      errors.push({ field, message: error })
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Debounce function for input validation
 */
export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Check if the user is accessing from a mobile device
 */
export const isMobileDevice = (): boolean => {
  if (!import.meta.client) return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Generate a secure random string for nonces, etc.
 */
export const generateRandomString = (length: number = 32): string => {
  if (!import.meta.client) return ''
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(str: string | null, fallback: T): T => {
  if (!str) return fallback
  
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if a string is a valid URL
 */
export const isValidUrl = (str: string): boolean => {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize HTML content (basic)
 */
export const sanitizeHtml = (str: string): string => {
  if (!import.meta.client) return str
  
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!import.meta.client || !navigator.clipboard) return false
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return targetDate.toLocaleDateString()
}

/**
 * Get initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

/**
 * Generate a color based on a string (for avatars, etc.)
 */
export const generateColorFromString = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Validate environment configuration
 */
export const validateEnvironment = (): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  const config = useRuntimeConfig()
  
  if (!config.public.apiBaseUrl) {
    errors.push('API base URL is not configured')
  }
  
  if (config.public.apiBaseUrl && !isValidUrl(config.public.apiBaseUrl)) {
    errors.push('API base URL is not a valid URL')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Check if the application is running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if the application is running in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production'
}

/**
 * Local storage helper with error handling
 */
export const localStorage = {
  get: <T>(key: string, fallback: T): T => {
    if (!import.meta.client) return fallback
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },
  
  set: (key: string, value: unknown): boolean => {
    if (!import.meta.client) return false
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove: (key: string): boolean => {
    if (!import.meta.client) return false
    
    try {
      window.localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  
  clear: (): boolean => {
    if (!import.meta.client) return false
    
    try {
      window.localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}

/**
 * Session storage helper with error handling
 */
export const sessionStorage = {
  get: <T>(key: string, fallback: T): T => {
    if (!import.meta.client) return fallback
    
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },
  
  set: (key: string, value: unknown): boolean => {
    if (!import.meta.client) return false
    
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove: (key: string): boolean => {
    if (!import.meta.client) return false
    
    try {
      window.sessionStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  
  clear: (): boolean => {
    if (!import.meta.client) return false
    
    try {
      window.sessionStorage.clear()
      return true
    } catch {
      return false
    }
  }
}
