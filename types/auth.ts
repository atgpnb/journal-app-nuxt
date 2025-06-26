// User related types
export interface User {
  id: number
  name: string
  username: string
  email: string
  email_verified_at?: string | null
  profile_picture?: string | null
  created_at: string
  updated_at?: string
}

// Request types
export interface SignupRequest {
  name: string
  username: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginRequest {
  username: string // Can be username or email
  password: string
  remember?: boolean
}

export interface UpdateProfileRequest {
  name?: string
  username?: string
  email?: string
}

export interface ChangePasswordRequest {
  current_password: string
  password: string
  password_confirmation: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  password: string
  password_confirmation: string
}

// Response types
export interface BaseApiResponse {
  success: boolean
  message: string
}

export interface AuthResponse extends BaseApiResponse {
  data: {
    user: User
    token: string
    token_type: string
  }
}

export type SignupResponse = AuthResponse
export type LoginResponse = AuthResponse

export interface UserResponse extends BaseApiResponse {
  data: {
    user: User
  }
}

export interface LogoutResponse extends BaseApiResponse {
  data?: null
}

export interface ForgotPasswordResponse extends BaseApiResponse {
  data?: null
}

export interface ResetPasswordResponse extends BaseApiResponse {
  data?: null
}

// Error types
export interface ValidationError {
  field: string
  message: string
}

export interface AuthError {
  success: false
  message: string
  errors?: Record<string, string[]>
  code?: string
  status?: number
}

// State types
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  lastActivity: number | null
}

// Token types
export interface TokenPayload {
  sub: string
  exp: number
  iat: number
  type: 'access' | 'refresh'
}

// Configuration types
export interface AuthConfig {
  apiBaseUrl: string
  tokenKey: string
  userKey: string
  cookieMaxAge: number
  sessionTimeout: number
  autoRefresh: boolean
}

// Form validation types
export interface FormFieldError {
  field: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: FormFieldError[]
}
