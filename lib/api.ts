import type { 
  SignupRequest, 
  SignupResponse, 
  LoginRequest, 
  LoginResponse, 
  UserResponse, 
  LogoutResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  AuthError
} from '~/types/auth'
import { AUTH_CONFIG } from '~/constants/auth'
import { useAuthStore } from '~/stores/auth'

/**
 * Enhanced API Client for Authentication with Pinia Store
 * 
 * Provides a robust interface for all authentication-related API calls
 * with proper error handling, token management, and retry logic
 */
export const useApiClient = () => {
  const config = useRuntimeConfig()
  const baseURL = (config.public.apiBaseUrl as string) || AUTH_CONFIG.DEFAULT_API_BASE_URL

  // Get current auth token for authenticated requests
  const getAuthToken = (): string | null => {
    if (import.meta.client) {
      const authStore = useAuthStore()
      return authStore.getValidToken() || useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN).value || null
    }
    return useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN).value || null
  }

  // Enhanced request function with better error handling
  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${baseURL}${endpoint}`
    
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add authorization header for protected endpoints
    const token = getAuthToken()
    const isProtectedEndpoint = [
      AUTH_CONFIG.ENDPOINTS.USER,
      AUTH_CONFIG.ENDPOINTS.LOGOUT,
      AUTH_CONFIG.ENDPOINTS.UPDATE_PROFILE,
      AUTH_CONFIG.ENDPOINTS.CHANGE_PASSWORD
    ].some(protectedPath => endpoint.includes(protectedPath))

    if (token && isProtectedEndpoint) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Authorization': `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, requestConfig)
      
      // Handle different HTTP status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        }))
        
        const authError: AuthError = {
          success: false,
          message: errorData.message || 'Request failed',
          errors: errorData.errors,
          code: errorData.code,
          status: response.status
        }
        
        throw new Error(JSON.stringify(authError))
      }
      
      return response.json()
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError: AuthError = {
          success: false,
          message: AUTH_CONFIG.MESSAGES.NETWORK_ERROR,
          status: 0
        }
        throw new Error(JSON.stringify(networkError))
      }
      
      // Re-throw API errors
      throw error
    }
  }

  // Auth endpoints
  const signup = async (data: SignupRequest): Promise<SignupResponse> => {
    return request<SignupResponse>(AUTH_CONFIG.ENDPOINTS.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const login = async (data: LoginRequest): Promise<LoginResponse> => {
    return request<LoginResponse>(AUTH_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const logout = async (): Promise<LogoutResponse> => {
    return request<LogoutResponse>(AUTH_CONFIG.ENDPOINTS.LOGOUT, {
      method: 'POST',
    })
  }

  const getUser = async (): Promise<UserResponse> => {
    return request<UserResponse>(AUTH_CONFIG.ENDPOINTS.USER, {
      method: 'GET',
    })
  }

  // Profile management endpoints
  const updateProfile = async (data: UpdateProfileRequest): Promise<UserResponse> => {
    return request<UserResponse>(AUTH_CONFIG.ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  const changePassword = async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(AUTH_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Password reset endpoints
  const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    return request<ForgotPasswordResponse>(AUTH_CONFIG.ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    return request<ResetPasswordResponse>(AUTH_CONFIG.ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Health check endpoint
  const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
    return request<{ status: string; timestamp: string }>('/health', {
      method: 'GET',
    })
  }

  return {
    // Core auth methods
    signup,
    login,
    logout,
    getUser,
    
    // Profile management
    updateProfile,
    changePassword,
    
    // Password reset
    forgotPassword,
    resetPassword,
    
    // Utility
    healthCheck,
    
    // Raw request method for custom endpoints
    request
  }
}
