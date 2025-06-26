# Authentication Setup for Journal App

This project now includes a complete authentication system using TanStack Query and Laravel API backend.

## Features

- ✅ User registration (signup) with form validation
- ✅ TanStack Query for API state management
- ✅ Authentication middleware for protected routes
- ✅ Guest middleware for auth pages
- ✅ Persistent auth state using localStorage
- ✅ Error handling with toast notifications
- ✅ Loading states and form validation
- ✅ Logout functionality

## API Integration

The app integrates with the Laravel API endpoint:
- **Signup**: `POST /api/auth/signup`

### Request Format
```json
{
  "name": "John Doe",
  "username": "johndoe", 
  "email": "john@example.com",
  "password": "MySecure!Pass123",
  "password_confirmation": "MySecure!Pass123"
}
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z) 
- At least one number (0-9)
- At least one special character (@$!%*?&)

## Configuration

Update the API base URL in `.env`:
```
NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

## File Structure

```
composables/
  useAuth.ts              # Main auth composable with TanStack Query
lib/
  api.ts                  # API client for backend communication
middleware/
  auth.ts                 # Protects authenticated routes
  guest.ts                # Redirects authenticated users from auth pages
types/
  auth.ts                 # TypeScript interfaces for auth
plugins/
  vue-query.client.ts     # TanStack Query setup
pages/
  signup/index.vue        # Updated signup page with API integration
  login/index.vue         # Login page (needs similar update)
  dashboard/index.vue     # Protected dashboard page
components/
  NavUser.vue             # Updated with logout functionality
  AppSidebar.vue          # Updated to show authenticated user data
```

## Usage

### Protected Routes
Add `middleware: 'auth'` to pages that require authentication:
```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Guest Routes (Auth Pages)
Add `middleware: 'guest'` to auth pages:
```vue
<script setup>
definePageMeta({
  middleware: 'guest'  
})
</script>
```

### Using Auth in Components
```vue
<script setup>
const { 
  isAuthenticated, 
  user, 
  signup, 
  logout,
  isSigningUp 
} = useAuth()
</script>
```

## Testing

Visit `/auth-test` to see the current authentication state and test navigation.

## Next Steps

1. Implement login functionality similar to signup
2. Add password reset functionality
3. Implement token refresh
4. Add user profile management
5. Enhance error handling
