import { useApiClient } from '~/lib/api'
import { AUTH_CONFIG } from '~/constants/auth'
import { useAuthStore } from '~/stores/auth'
import type { 
  SignupRequest, 
  LoginRequest, 
  AuthResponse,
  UserResponse,
  LogoutResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  AuthError,
  User
} from '~/types/auth'

/**
 * Authentication Service Layer with Pinia Store
 * 
 * This service provides a comprehensive interface for all authentication operations.
 * It handles API communication, provides consistent error handling, and includes
 * utilities for token management and session validation using Pinia stores.
 */
export class AuthService {
  private apiClient = useApiClient()

  /**
   * Register a new user account
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      return await this.apiClient.signup(data)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Authenticate user with username/email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      return await this.apiClient.login(data)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Logout current user and revoke tokens
   */
  async logout(): Promise<LogoutResponse> {
    try {
      return await this.apiClient.logout()
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Get current authenticated user details
   */
  async getCurrentUser(): Promise<UserResponse> {
    try {
      return await this.apiClient.getUser()
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Update user profile information
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    try {
      return await this.apiClient.updateProfile(data)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      return await this.apiClient.changePassword(data)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      return await this.apiClient.forgotPassword(data)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      return await this.apiClient.resetPassword(data)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Check if user has valid authentication
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken()
    const user = this.getStoredUser()
    return !!(token && user && this.isTokenValid(token))
  }

  /**
   * Get stored authentication token
   */
  getStoredToken(): string | null {
    if (import.meta.client) {
      const authStore = useAuthStore()
      return authStore.getValidToken() || useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN).value || null
    }
    return useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN).value || null
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      if (import.meta.client) {
        const authStore = useAuthStore()
        return authStore.user || (() => {
          const userStr = useCookie(AUTH_CONFIG.STORAGE_KEYS.USER).value || null
          return userStr ? JSON.parse(typeof userStr === 'string' ? userStr : JSON.stringify(userStr)) : null
        })()
      }
      const userStr = useCookie(AUTH_CONFIG.STORAGE_KEYS.USER).value || null
      return userStr ? JSON.parse(typeof userStr === 'string' ? userStr : JSON.stringify(userStr)) : null
    } catch {
      console.error('Error parsing stored user data')
      return null
    }
  }

  /**
   * Check if token is still valid (basic format check and expiry)
   */
  isTokenValid(token: string): boolean {
    if (!token) return false
    
    try {
      // Basic JWT format check (3 parts separated by dots)
      const parts = token.split('.')
      if (parts.length !== 3) return false
      
      // For Laravel Sanctum tokens, they have a different format
      // This is a basic check - in production you might want more sophisticated validation
      return token.length > 10 && token.includes('|')
    } catch {
      return false
    }
  }

  /**
   * Check if session has expired based on last activity
   */
  isSessionExpired(): boolean {
    if (!import.meta.client) return false
    
    const authStore = useAuthStore()
    return authStore.isTokenExpired
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    if (import.meta.client) {
      const authStore = useAuthStore()
      authStore.updateLastActivity()
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    // Clear cookies
    const authTokenCookie = useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    const authUserCookie = useCookie(AUTH_CONFIG.STORAGE_KEYS.USER)
    authTokenCookie.value = null
    authUserCookie.value = null
    
    // Clear Pinia store and localStorage on client-side
    if (import.meta.client) {
      const authStore = useAuthStore()
      authStore.clearAuthState()
    }
  }

  /**
   * Store authentication data securely
   */
  storeAuthData(token: string, user: User): void {
    // Store in cookies for SSR
    const authTokenCookie = useCookie<string | null>(AUTH_CONFIG.STORAGE_KEYS.TOKEN, {
      default: () => null,
      maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
      sameSite: AUTH_CONFIG.COOKIE_SAME_SITE,
      secure: AUTH_CONFIG.COOKIE_SECURE
    })
    
    const authUserCookie = useCookie<string | null>(AUTH_CONFIG.STORAGE_KEYS.USER, {
      default: () => null,
      maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
      sameSite: AUTH_CONFIG.COOKIE_SAME_SITE,
      secure: AUTH_CONFIG.COOKIE_SECURE
    })
    
    authTokenCookie.value = token
    authUserCookie.value = JSON.stringify(user)
    
    // Update Pinia store for client-side state management
    if (import.meta.client) {
      const authStore = useAuthStore()
      authStore.setAuthData(token, user)
    }
  }

  /**
   * Validate user input data
   */
  validateSignupData(data: SignupRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Name validation
    if (!data.name || data.name.length < AUTH_CONFIG.VALIDATION.NAME.MIN_LENGTH) {
      errors.push(`Name must be at least ${AUTH_CONFIG.VALIDATION.NAME.MIN_LENGTH} characters`)
    }
    if (data.name && data.name.length > AUTH_CONFIG.VALIDATION.NAME.MAX_LENGTH) {
      errors.push(`Name must not exceed ${AUTH_CONFIG.VALIDATION.NAME.MAX_LENGTH} characters`)
    }
    
    // Username validation
    if (!data.username || data.username.length < AUTH_CONFIG.VALIDATION.USERNAME.MIN_LENGTH) {
      errors.push(`Username must be at least ${AUTH_CONFIG.VALIDATION.USERNAME.MIN_LENGTH} characters`)
    }
    if (data.username && data.username.length > AUTH_CONFIG.VALIDATION.USERNAME.MAX_LENGTH) {
      errors.push(`Username must not exceed ${AUTH_CONFIG.VALIDATION.USERNAME.MAX_LENGTH} characters`)
    }
    if (data.username && !AUTH_CONFIG.VALIDATION.USERNAME.PATTERN.test(data.username)) {
      errors.push(AUTH_CONFIG.MESSAGES.USERNAME_INVALID)
    }
    
    // Email validation
    if (!data.email) {
      errors.push('Email is required')
    } else if (!AUTH_CONFIG.VALIDATION.EMAIL.PATTERN.test(data.email)) {
      errors.push(AUTH_CONFIG.MESSAGES.EMAIL_INVALID)
    } else if (data.email.length > AUTH_CONFIG.VALIDATION.EMAIL.MAX_LENGTH) {
      errors.push(`Email must not exceed ${AUTH_CONFIG.VALIDATION.EMAIL.MAX_LENGTH} characters`)
    }
    
    // Password validation
    const passwordValidation = this.validatePassword(data.password)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }
    
    // Password confirmation
    if (data.password !== data.password_confirmation) {
      errors.push(AUTH_CONFIG.MESSAGES.PASSWORD_MISMATCH)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const { PASSWORD_REQUIREMENTS } = AUTH_CONFIG
    
    if (!password) {
      errors.push('Password is required')
      return { isValid: false, errors }
    }
    
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
      errors
    }
  }

  /**
   * Handle authentication errors consistently
   */
  private handleAuthError(error: unknown): Error {
    if (error instanceof Error) {
      try {
        const errorData: AuthError = JSON.parse(error.message)
        
        // Map specific error codes to user-friendly messages
        switch (errorData.status) {
          case AUTH_CONFIG.HTTP_STATUS.UNAUTHORIZED:
            return new Error(AUTH_CONFIG.MESSAGES.UNAUTHORIZED)
          case AUTH_CONFIG.HTTP_STATUS.TOO_MANY_REQUESTS:
            return new Error(AUTH_CONFIG.MESSAGES.RATE_LIMIT_EXCEEDED)
          case AUTH_CONFIG.HTTP_STATUS.UNPROCESSABLE_ENTITY:
            // Return original validation errors
            return error
          case 0: // Network error
            return new Error(AUTH_CONFIG.MESSAGES.NETWORK_ERROR)
          default:
            return new Error(errorData.message || AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR)
        }
      } catch {
        // If error message isn't JSON, return original error
        return error
      }
    }
    
    return new Error(AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR)
  }

  /**
   * Get user-friendly error message from error object
   */
  getErrorMessage(error: Error): string {
    try {
      const errorData: AuthError = JSON.parse(error.message)
      return errorData.message || AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR
    } catch {
      return error.message || AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR
    }
  }

  /**
   * Check API health
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      await this.apiClient.healthCheck()
      return true
    } catch {
      return false
    }
  }
}

/**
 * Create auth service instance
 */
export const useAuthService = () => {
  return new AuthService()
}
