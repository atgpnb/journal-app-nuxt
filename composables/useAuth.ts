import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useApiClient } from '~/lib/api'
import { AUTH_CONFIG } from '~/constants/auth'
import { useAuthStore } from '~/stores/auth'
import type { 
  SignupRequest, 
  LoginRequest, 
  AuthError, 
  AuthState, 
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '~/types/auth'

/**
 * Enhanced Authentication Composable with Pinia Store
 * 
 * Provides a comprehensive authentication system with:
 * - Pinia-based state management
 * - SSR-safe state management
 * - Automatic token refresh
 * - Session timeout handling
 * - Enhanced error handling
 * - Profile management
 */
export const useAuth = () => {
  const queryClient = useQueryClient()
  const apiClient = useApiClient()
  const authStore = useAuthStore()
  
  // Get auth state from store and cookies for SSR compatibility
  const getStoredAuth = (): AuthState => {
    if (import.meta.client) {
      // Client-side: use store state which is populated from localStorage
      return {
        user: authStore.user,
        token: authStore.token,
        isAuthenticated: authStore.isAuthenticated,
        isLoading: authStore.isLoading,
        lastActivity: authStore.lastActivity
      }
    } else {
      // Server-side: use cookies only
      const token = useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN).value || null
      const userStr = useCookie(AUTH_CONFIG.STORAGE_KEYS.USER).value || null
      const user = userStr ? JSON.parse(typeof userStr === 'string' ? userStr : JSON.stringify(userStr)) : null
      
      return {
        user,
        token,
        isAuthenticated: !!(token && user),
        isLoading: false,
        lastActivity: null
      }
    }
  }

  // Store auth data in both store and cookies
  const setAuthData = (token: string, user: User) => {
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
    
    // Set cookies (works on both server and client)
    authTokenCookie.value = token
    authUserCookie.value = JSON.stringify(user)
    
    // Update Pinia store (client-side only)
    if (import.meta.client) {
      authStore.setAuthData(token, user)
    }
  }

  // Clear auth data from both store and cookies
  const clearAuthData = () => {
    const authTokenCookie = useCookie(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    const authUserCookie = useCookie(AUTH_CONFIG.STORAGE_KEYS.USER)
    
    // Clear cookies
    authTokenCookie.value = null
    authUserCookie.value = null
    
    // Clear Pinia store (client-side only)
    if (import.meta.client) {
      authStore.clearAuthState()
    }
  }

  // Update last activity timestamp
  const updateLastActivity = () => {
    if (import.meta.client) {
      authStore.updateLastActivity()
    }
  }

  // Check if session has expired
  const isSessionExpired = (): boolean => {
    if (!import.meta.client) return false
    return authStore.isTokenExpired
  }

  // Reactive auth state that combines store state and SSR compatibility
  const authState = computed<AuthState>(() => getStoredAuth())

  // Handle authentication errors with user-friendly messages
  const handleAuthError = (error: Error): string => {
    try {
      const errorData: AuthError = JSON.parse(error.message)
      
      // Handle specific HTTP status codes
      switch (errorData.status) {
        case AUTH_CONFIG.HTTP_STATUS.UNAUTHORIZED:
          return AUTH_CONFIG.MESSAGES.UNAUTHORIZED
        case AUTH_CONFIG.HTTP_STATUS.TOO_MANY_REQUESTS:
          return AUTH_CONFIG.MESSAGES.RATE_LIMIT_EXCEEDED
        case AUTH_CONFIG.HTTP_STATUS.UNPROCESSABLE_ENTITY:
          return errorData.message || AUTH_CONFIG.MESSAGES.VALIDATION_ERROR
        case 0: // Network error
          return AUTH_CONFIG.MESSAGES.NETWORK_ERROR
        default:
          return errorData.message || AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR
      }
    } catch {
      return error.message || AUTH_CONFIG.MESSAGES.UNEXPECTED_ERROR
    }
  }

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => apiClient.signup(data),
    onSuccess: (response) => {
      const { token, user } = response.data
      setAuthData(token, user)
      
      // Navigate to dashboard after successful signup
      navigateTo(AUTH_CONFIG.ROUTES.DASHBOARD)
    },
    onError: (error: Error) => {
      console.error('Signup error:', handleAuthError(error))
    }
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (response) => {
      const { token, user } = response.data
      setAuthData(token, user)
      
      // Navigate to dashboard after successful login
      navigateTo(AUTH_CONFIG.ROUTES.DASHBOARD)
    },
    onError: (error: Error) => {
      console.error('Login error:', handleAuthError(error))
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      performLogout()
    },
    onError: (error: Error) => {
      // Even if logout fails on server, clear local data
      performLogout()
      console.error('Logout error:', handleAuthError(error))
    }
  })

  // Common logout logic
  const performLogout = () => {
    clearAuthData()
    
    // Invalidate all queries
    queryClient.clear()
    
    // Navigate to login
    navigateTo(AUTH_CONFIG.ROUTES.LOGIN)
  }

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => apiClient.updateProfile(data),
    onSuccess: (response) => {
      const { user } = response.data
      // Get the current token from authState and update both cookie and store
      const currentToken = authState.value.token
      if (currentToken) {
        setAuthData(currentToken, user)
      }
    },
    onError: (error: Error) => {
      console.error('Profile update error:', handleAuthError(error))
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => apiClient.changePassword(data),
    onError: (error: Error) => {
      console.error('Password change error:', handleAuthError(error))
    }
  })

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => apiClient.forgotPassword(data),
    onError: (error: Error) => {
      console.error('Forgot password error:', handleAuthError(error))
    }
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => apiClient.resetPassword(data),
    onSuccess: () => {
      // Navigate to login after successful password reset
      navigateTo(AUTH_CONFIG.ROUTES.LOGIN)
    },
    onError: (error: Error) => {
      console.error('Reset password error:', handleAuthError(error))
    }
  })

  // Get current user query (for refreshing user data)
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.getUser(),
    enabled: computed(() => authState.value.isAuthenticated),
    retry: false
  })

  // Handle user query side effects
  watch(
    () => userQuery.data.value,
    (response) => {
      if (response && response.data && response.data.user) {
        const currentToken = authState.value.token
        if (currentToken) {
          setAuthData(currentToken, response.data.user)
        }
      }
    }
  )

  watch(
    () => userQuery.error.value,
    (error) => {
      if (error) {
        try {
          const errorData: AuthError = JSON.parse(error.message)
          if (errorData.status === AUTH_CONFIG.HTTP_STATUS.UNAUTHORIZED) {
            performLogout()
          }
        } catch {
          // Handle non-JSON errors
        }
      }
    }
  )

  // Session management
  const checkSession = () => {
    if (authState.value.isAuthenticated && isSessionExpired()) {
      performLogout()
      // You could show a toast here about session expiration
    }
  }

  // Auto-check session on client side
  if (import.meta.client) {
    const intervalId = setInterval(checkSession, AUTH_CONFIG.SESSION.ACTIVITY_CHECK_INTERVAL)
    
    // Cleanup on unmount
    onUnmounted(() => {
      clearInterval(intervalId)
    })
    
    // Update activity on user interaction
    const updateActivity = () => {
      if (authState.value.isAuthenticated) {
        updateLastActivity()
      }
    }
    
    // Listen for user activity
    document.addEventListener('click', updateActivity)
    document.addEventListener('keypress', updateActivity)
    document.addEventListener('scroll', updateActivity)
    
    onUnmounted(() => {
      document.removeEventListener('click', updateActivity)
      document.removeEventListener('keypress', updateActivity)
      document.removeEventListener('scroll', updateActivity)
    })
  }

  // Computed properties
  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const user = computed(() => authState.value.user)
  const token = computed(() => authState.value.token)
  const isLoading = computed(() => authState.value.isLoading)

  return {
    // State
    authState: readonly(authState),
    isAuthenticated,
    user,
    token,
    isLoading,
    
    // Actions
    signup: signupMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    
    // Utilities
    refreshUser: userQuery.refetch,
    checkSession,
    handleAuthError,
    
    // Mutation states
    isSigningUp: signupMutation.isPending,
    signupError: computed(() => signupMutation.error.value ? handleAuthError(signupMutation.error.value) : null),
    isSignupSuccess: signupMutation.isSuccess,
    
    isLoggingIn: loginMutation.isPending,
    loginError: computed(() => loginMutation.error.value ? handleAuthError(loginMutation.error.value) : null),
    isLoginSuccess: loginMutation.isSuccess,
    
    isLoggingOut: logoutMutation.isPending,
    logoutError: computed(() => logoutMutation.error.value ? handleAuthError(logoutMutation.error.value) : null),
    
    isUpdatingProfile: updateProfileMutation.isPending,
    profileError: computed(() => updateProfileMutation.error.value ? handleAuthError(updateProfileMutation.error.value) : null),
    isProfileSuccess: updateProfileMutation.isSuccess,
    
    isChangingPassword: changePasswordMutation.isPending,
    passwordError: computed(() => changePasswordMutation.error.value ? handleAuthError(changePasswordMutation.error.value) : null),
    isPasswordSuccess: changePasswordMutation.isSuccess,
    
    isForgotPassword: forgotPasswordMutation.isPending,
    forgotPasswordError: computed(() => forgotPasswordMutation.error.value ? handleAuthError(forgotPasswordMutation.error.value) : null),
    isForgotPasswordSuccess: forgotPasswordMutation.isSuccess,
    
    isResetPassword: resetPasswordMutation.isPending,
    resetPasswordError: computed(() => resetPasswordMutation.error.value ? handleAuthError(resetPasswordMutation.error.value) : null),
    isResetPasswordSuccess: resetPasswordMutation.isSuccess,
  }
}
