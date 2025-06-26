/**
 * Authentication Constants
 * 
 * Centralized configuration for authentication-related settings
 */

export const AUTH_CONFIG = {
  // API Configuration
  DEFAULT_API_BASE_URL: 'http://127.0.0.1:8000/api',
  
  // Cookie settings
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days
  COOKIE_SAME_SITE: 'lax' as const,
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  
  // LocalStorage keys
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER: 'auth_user',
    REFRESH_TOKEN: 'auth_refresh_token',
    LAST_ACTIVITY: 'auth_last_activity'
  },
  
  // API endpoints
  ENDPOINTS: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER: '/auth/user',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    UPDATE_PROFILE: '/auth/profile'
  },
  
  // Routes
  ROUTES: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/dashboard',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    PROFILE: '/profile'
  },
  
  // Session management
  SESSION: {
    TIMEOUT: 60 * 60 * 1000, // 1 hour in milliseconds
    REFRESH_THRESHOLD: 15 * 60 * 1000, // 15 minutes before expiry
    MAX_RETRY_ATTEMPTS: 3,
    ACTIVITY_CHECK_INTERVAL: 60 * 1000 // 1 minute
  },
  
  // Password requirements
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    PATTERNS: {
      UPPERCASE: /[A-Z]/,
      LOWERCASE: /[a-z]/,
      NUMBER: /\d/,
      SPECIAL_CHAR: /[@$!%*?&]/,
    },
  },
  
  // Form validation
  VALIDATION: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50,
    },
    USERNAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50,
      PATTERN: /^[a-zA-Z0-9_-]+$/,
    },
    EMAIL: {
      MAX_LENGTH: 255,
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },
  
  // Rate limiting
  RATE_LIMITS: {
    LOGIN_ATTEMPTS: 5,
    SIGNUP_ATTEMPTS: 3,
    PASSWORD_RESET_ATTEMPTS: 3,
    LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutes
  },
  
  // Toast messages
  MESSAGES: {
    SIGNUP_SUCCESS: 'Account created successfully!',
    SIGNUP_SUCCESS_DESC: 'Welcome to Journal App! You can now start writing.',
    LOGIN_SUCCESS: 'Login successful!',
    LOGIN_SUCCESS_DESC: 'Welcome back!',
    LOGOUT_SUCCESS: 'Logged out successfully',
    LOGOUT_SUCCESS_DESC: 'See you later!',
    PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
    PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
    PASSWORD_RESET_SENT: 'Password reset email sent',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    
    // Error messages
    VALIDATION_ERROR: 'Validation Error',
    SIGNUP_FAILED: 'Signup Failed',
    LOGIN_FAILED: 'Login Failed',
    LOGOUT_FAILED: 'Logout Failed',
    PROFILE_UPDATE_FAILED: 'Profile Update Failed',
    PASSWORD_CHANGE_FAILED: 'Password Change Failed',
    FORGOT_PASSWORD_FAILED: 'Password Reset Failed',
    
    // Generic messages
    UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later.',
    
    // Validation messages
    TERMS_REQUIRED: 'You must agree to the terms and conditions',
    EMAIL_INVALID: 'Please enter a valid email address',
    USERNAME_INVALID: 'Username can only contain letters, numbers, hyphens, and underscores',
    PASSWORD_MISMATCH: 'Passwords do not match',
    CURRENT_PASSWORD_REQUIRED: 'Current password is required',
  },
  
  // HTTP Status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  }
} as const

/**
 * Password validation helper with enhanced feedback
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const { PASSWORD_REQUIREMENTS } = AUTH_CONFIG
  
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`)
  }
  
  if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`)
  }
  
  if (!PASSWORD_REQUIREMENTS.PATTERNS.UPPERCASE.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)')
  }
  
  if (!PASSWORD_REQUIREMENTS.PATTERNS.LOWERCASE.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)')
  }
  
  if (!PASSWORD_REQUIREMENTS.PATTERNS.NUMBER.test(password)) {
    errors.push('Password must contain at least one number (0-9)')
  }
  
  if (!PASSWORD_REQUIREMENTS.PATTERNS.SPECIAL_CHAR.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Email validation helper
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const { EMAIL } = AUTH_CONFIG.VALIDATION
  
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (email.length > EMAIL.MAX_LENGTH) {
    return { isValid: false, error: `Email must not exceed ${EMAIL.MAX_LENGTH} characters` }
  }
  
  if (!EMAIL.PATTERN.test(email)) {
    return { isValid: false, error: AUTH_CONFIG.MESSAGES.EMAIL_INVALID }
  }
  
  return { isValid: true }
}

/**
 * Username validation helper
 */
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  const { USERNAME } = AUTH_CONFIG.VALIDATION
  
  if (!username) {
    return { isValid: false, error: 'Username is required' }
  }
  
  if (username.length < USERNAME.MIN_LENGTH) {
    return { isValid: false, error: `Username must be at least ${USERNAME.MIN_LENGTH} characters` }
  }
  
  if (username.length > USERNAME.MAX_LENGTH) {
    return { isValid: false, error: `Username must not exceed ${USERNAME.MAX_LENGTH} characters` }
  }
  
  if (!USERNAME.PATTERN.test(username)) {
    return { isValid: false, error: AUTH_CONFIG.MESSAGES.USERNAME_INVALID }
  }
  
  return { isValid: true }
}

/**
 * Check password strength with detailed feedback
 */
export const getPasswordStrength = (password: string): {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')
  
  if (password.length >= 12) score += 1
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security')
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Add uppercase letters')
  
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Add lowercase letters')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('Add numbers')
  
  if (/[@$!%*?&]/.test(password)) score += 1
  else feedback.push('Add special characters (@$!%*?&)')
  
  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong'
  if (score <= 2) level = 'weak'
  else if (score <= 3) level = 'fair'
  else if (score <= 4) level = 'good'
  else level = 'strong'
  
  return { score, level, feedback }
}
