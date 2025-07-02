# Authentication System Documentation

A├── utils/
    └── auth.ts              # Authentication utility functions
```prehensive, production-ready authentication system for Nuxt 3 applications with Laravel API backend integration.

## 🚀 Features

- **Complete Authentication Flow**: Signup, login, logout, password reset, profile management
- **SSR-Safe**: Works seamlessly with server-side rendering
- **Security-First**: Session management, password strength validation, rate limiting
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **User-Friendly**: Shadcn-vue components with proper validation and error handling
- **Maintainable**: Clean architecture with service layers and composables
- **Testing**: Built-in API testing utilities and validation helpers

## 📁 Project Structure

```
authentication-system/
├── constants/
│   └── auth.ts              # Authentication constants and validation helpers
├── composables/
│   └── useAuth.ts           # Main authentication composable
├── lib/
│   └── api.ts               # API client with enhanced error handling
├── middleware/
│   ├── auth.ts              # Authentication middleware
│   └── guest.ts             # Guest-only middleware
├── pages/
│   ├── login/
│   │   └── index.vue        # Login page
│   ├── signup/
│   │   └── index.vue        # Signup page
│   ├── forgot-password/
│   │   └── index.vue        # Password reset page
│   └── profile/
│       └── index.vue        # User profile management
├── plugins/
│   └── auth.client.ts       # Client-side authentication plugin
├── services/
│   └── auth.ts              # Authentication service layer
├── types/
│   └── auth.ts              # TypeScript type definitions
└── utils/
    └── auth.ts              # Authentication utility functions
```

## 🛠️ Setup & Installation

### 1. Environment Configuration

Create a `.env` file in your project root:

```env
# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api

# Application Configuration
NUXT_PUBLIC_APP_NAME="Journal App"
NUXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication Configuration
NUXT_PUBLIC_AUTH_COOKIE_SECURE=false
NUXT_PUBLIC_AUTH_SESSION_TIMEOUT=3600000

# Development Configuration
NODE_ENV=development
```

### 2. Laravel API Backend

Ensure your Laravel API is running with the following endpoints:

```
POST /api/auth/signup          # User registration
POST /api/auth/login           # User login
POST /api/auth/logout          # User logout
GET  /api/auth/user            # Get authenticated user
PUT  /api/auth/profile         # Update user profile
POST /api/auth/change-password # Change password
POST /api/auth/forgot-password # Send password reset email
POST /api/auth/reset-password  # Reset password with token
```

### 3. Dependencies

The system uses these key dependencies (already included in package.json):

- `@tanstack/vue-query` - Data fetching and caching
- `@vee-validate/zod` - Form validation
- `zod` - Schema validation
- `vue-sonner` - Toast notifications
- Shadcn-vue components

## 🔧 Usage

### Basic Authentication

```vue
<script setup>
// Use the authentication composable
const { 
  login, 
  signup, 
  logout, 
  user, 
  isAuthenticated,
  isLoggingIn,
  loginError 
} = useAuth()

// Login user
const handleLogin = () => {
  login({
    username: 'user@example.com',
    password: 'MySecure!Pass123'
  })
}
</script>
```

### Form Validation

```vue
<script setup>
import { AUTH_CONFIG, validatePassword } from '@/constants/auth'

// Validate password strength
const passwordValidation = validatePassword('MySecure!Pass123')
if (!passwordValidation.isValid) {
  console.log('Password errors:', passwordValidation.errors)
}
</script>
```

### Protected Routes

```vue
<script setup>
// Protect page with authentication middleware
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Guest-Only Routes

```vue
<script setup>
// Only allow unauthenticated users
definePageMeta({
  middleware: 'guest'
})
</script>
```

## 🔐 Security Features

### Password Security

```typescript
// Password requirements (configurable in constants/auth.ts)
const requirements = {
  minLength: 8,
  maxLength: 100,
  patterns: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /\d/,
    specialChar: /[@$!%*?&]/
  }
}
```

### Session Management

```typescript
// Automatic session timeout and activity tracking
const session = {
  timeout: 60 * 60 * 1000,      // 1 hour
  activityCheck: 60 * 1000,     // Check every minute
  refreshThreshold: 15 * 60 * 1000  // Refresh 15 minutes before expiry
}
```

### Rate Limiting

```typescript
// Client-side rate limiting
const rateLimits = {
  loginAttempts: 5,
  signupAttempts: 3,
  passwordResetAttempts: 3,
  lockoutDuration: 15 * 60 * 1000  // 15 minutes
}
```

## 📡 API Integration

### API Client

```typescript
// Enhanced API client with error handling
const apiClient = useApiClient()

// All endpoints are available
await apiClient.signup(signupData)
await apiClient.login(loginData)
await apiClient.logout()
await apiClient.getUser()
await apiClient.updateProfile(profileData)
await apiClient.changePassword(passwordData)
```

### Error Handling

```typescript
// Comprehensive error handling with user-friendly messages
try {
  await apiClient.login(loginData)
} catch (error) {
  const { message, fieldErrors, statusCode } = parseAuthError(error)
  
  // Handle specific errors
  if (statusCode === 401) {
    // Invalid credentials
  } else if (statusCode === 422) {
    // Validation errors
    fieldErrors.forEach(({ field, message }) => {
      setFieldError(field, message)
    })
  }
}
```

## 🧪 Testing

### API Testing

### Manual Testing

```bash
# Test API endpoints directly
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User", 
    "username": "testuser",
    "email": "test@example.com",
    "password": "MySecure!Pass123",
    "password_confirmation": "MySecure!Pass123"
  }'
```

## 🎨 UI Components

### Login Form

```vue
<template>
  <form @submit="onSubmit">
    <FormField name="username">
      <FormItem>
        <FormLabel>Username or Email</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    
    <Button type="submit" :disabled="isLoggingIn">
      Login
    </Button>
  </form>
</template>
```

### Password Strength Indicator

```vue
<template>
  <div class="password-strength">
    <div class="strength-bar">
      <div 
        v-for="i in 4" 
        :key="i"
        :class="getStrengthClass(i)"
      />
    </div>
    <span>{{ passwordStrength.level }}</span>
  </div>
</template>
```

## 📊 State Management

### Authentication State

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  lastActivity: number | null
}
```

### Reactive Updates

```typescript
// Authentication state is reactive across components
const { user, isAuthenticated } = useAuth()

// Updates automatically when user logs in/out
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    // User logged in
  } else {
    // User logged out
  }
})
```

## 🔄 Middleware

### Authentication Middleware

```typescript
// Protects routes requiring authentication
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
```

### Guest Middleware

```typescript
// Redirects authenticated users away from guest-only pages
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})
```

## 🎯 Best Practices

### 1. Error Handling

```typescript
// Always handle errors gracefully
try {
  await authAction()
} catch (error) {
  const userFriendlyMessage = getErrorMessage(error)
  toast.error(userFriendlyMessage)
}
```

### 2. Form Validation

```typescript
// Use client-side validation with server-side backup
const validation = validateEmail(email)
if (!validation.isValid) {
  setFieldError('email', validation.error)
  return
}
```

### 3. Loading States

```vue
<template>
  <Button :disabled="isLoading">
    <Icon v-if="isLoading" name="loader" class="animate-spin" />
    {{ isLoading ? 'Processing...' : 'Submit' }}
  </Button>
</template>
```

### 4. Security Considerations

```typescript
// Always validate on both client and server
// Use HTTPS in production
// Implement proper CORS policies
// Use secure cookies
// Implement rate limiting
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```typescript
   // Ensure Laravel API has proper CORS configuration
   // Check API base URL in environment variables
   ```

2. **Session Timeout**
   ```typescript
   // Adjust session timeout in constants/auth.ts
   // Implement token refresh if needed
   ```

3. **Validation Errors**
   ```typescript
   // Check password requirements match API
   // Ensure all required fields are provided
   ```

### Debug Mode

```typescript
// Enable debug logging
const { handleAuthError } = useAuth()

// Logs detailed error information
console.log('Auth error:', handleAuthError(error))
```

## 📈 Performance Optimization

### 1. Lazy Loading

```typescript
// Pages are automatically code-split
// Components load only when needed
```

### 2. Caching

```typescript
// User data is cached with Vue Query
// Reduces unnecessary API calls
```

### 3. SSR Optimization

```typescript
// Authentication works with SSR
// No flash of unauthenticated content
```

## 🔮 Future Enhancements

- [ ] OAuth integration (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication
- [ ] Advanced session management
- [ ] Audit logging
- [ ] Role-based access control (RBAC)
- [ ] Multi-tenant support

## 📝 License

This authentication system is part of the Journal App project. Please refer to the project's license for usage terms.

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for any changes
4. Ensure TypeScript types are properly defined
5. Test with both development and production environments

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Test with the built-in API testing utilities
4. Check browser console for detailed error messages

---

**Built with ❤️ using Nuxt 3, TypeScript, and Shadcn-vue**
