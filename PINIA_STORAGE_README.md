# Pinia Storage System

This document describes the refactored storage system using Pinia for state management and localStorage persistence.

## Overview

The storage system has been completely refactored to use Pinia stores for better state management, reactivity, and maintainability. The new system provides:

- **Reactive state management** with Pinia
- **SSR-safe localStorage access**
- **Automatic synchronization** between tabs/windows
- **Type-safe interfaces**
- **Backward compatibility** with existing code
- **Enhanced error handling**

## Architecture

### Core Components

1. **Storage Store** (`stores/storage.ts`) - Low-level localStorage operations
2. **Auth Store** (`stores/auth.ts`) - Authentication state management
3. **Storage Composable** (`composables/useStorage.ts`) - Convenient interface
4. **Storage Plugin** (`plugins/storage.client.ts`) - Client-side initialization

## Stores

### Storage Store (`useStorageStore`)

The foundation store that handles all localStorage operations with SSR safety and error handling.

```typescript
const storageStore = useStorageStore()

// Basic operations
storageStore.setItem('key', 'value')
const value = storageStore.getItem('key')
storageStore.removeItem('key')
storageStore.clear()

// JSON operations
storageStore.setJSON('user', { name: 'John', age: 30 })
const user = storageStore.getJSON<User>('user')

// Reactive getters
const reactiveValue = storageStore.getReactive('key', 'default')
const reactiveUser = storageStore.getJSONReactive<User>('user')

// Watch for changes from other tabs
const cleanup = storageStore.watchStorage((key, newValue, oldValue) => {
  console.log(`${key} changed from ${oldValue} to ${newValue}`)
})
```

#### Key Features

- **SSR Safety**: Automatically detects if localStorage is available
- **Error Handling**: Graceful fallbacks for localStorage errors
- **Caching**: In-memory cache for performance
- **Reactivity**: Computed properties for reactive localStorage values
- **Cross-tab Sync**: Automatic synchronization between browser tabs

### Auth Store (`useAuthStore`)

Specialized store for authentication state management using the storage store.

```typescript
const authStore = useAuthStore()

// Authentication state (readonly)
const { token, user, isAuthenticated, isLoading } = authStore

// Computed properties
console.log(authStore.isTokenExpired)
console.log(authStore.shouldRefreshToken)

// Methods
authStore.setAuthData(token, user)
authStore.updateUser({ name: 'Updated Name' })
authStore.updateLastActivity()
authStore.clearAuthState()
authStore.logout()

// Reactive properties
authStore.tokenReactive = 'new-token'
authStore.userReactive = { id: 1, name: 'John' }
```

#### Key Features

- **Reactive Authentication State**: All auth data is reactive
- **Session Management**: Automatic session timeout handling
- **Token Validation**: Built-in token expiry checking
- **Persistent Storage**: Automatic localStorage synchronization
- **Cross-tab Authentication**: Sync auth state between tabs

## Composables

### useStorage

Provides a convenient interface to the storage store with backward compatibility.

```typescript
const storage = useStorage()

// New interface
storage.setItem('key', 'value')
storage.getJSON<User>('user')
storage.getReactive('setting', 'default')

// Backward compatibility
storage.setLocalStorageItem('key', 'value')
storage.getLocalStorageJSON<User>('user')
```

### useAuth (Updated)

The authentication composable has been updated to use the auth store while maintaining API compatibility.

```typescript
const { authState, login, logout, signup } = useAuth()

// Reactive auth state
watchEffect(() => {
  console.log('Auth state changed:', authState.value)
})
```

## Migration Guide

### From Old Storage Utils

**Before:**
```typescript
import { 
  getLocalStorageItem, 
  setLocalStorageItem,
  getLocalStorageJSON 
} from '~/utils/storage'

const token = getLocalStorageItem('auth_token')
setLocalStorageItem('auth_token', newToken)
const user = getLocalStorageJSON<User>('auth_user')
```

**After:**
```typescript
// Option 1: Use the storage composable (recommended)
const storage = useStorage()
const token = storage.getItem('auth_token')
storage.setItem('auth_token', newToken)
const user = storage.getJSON<User>('auth_user')

// Option 2: Use stores directly for advanced features
const storageStore = useStorageStore()
const authStore = useAuthStore()
```

### Authentication Code

**Before:**
```typescript
import { setLocalStorageItem, getLocalStorageItem } from '~/utils/storage'

// Set auth data
setLocalStorageItem('auth_token', token)
setLocalStorageJSON('auth_user', user)

// Get auth data
const token = getLocalStorageItem('auth_token')
const user = getLocalStorageJSON('auth_user')
```

**After:**
```typescript
const authStore = useAuthStore()

// Set auth data
authStore.setAuthData(token, user)

// Get auth data (reactive)
const token = authStore.token
const user = authStore.user
const isAuthenticated = authStore.isAuthenticated
```

## Best Practices

### 1. Use Stores for Complex State

For complex state management, use stores directly:

```typescript
// Good: Direct store usage for complex logic
const authStore = useAuthStore()
const userProfile = computed(() => ({
  ...authStore.user,
  isOnline: authStore.isAuthenticated && !authStore.isTokenExpired
}))
```

### 2. Use Composables for Simple Operations

For simple localStorage operations, use the composable:

```typescript
// Good: Composable for simple operations
const storage = useStorage()
const theme = storage.getReactive('theme', 'light')
```

### 3. Reactive Data Patterns

Leverage reactive patterns for automatic UI updates:

```typescript
// Reactive user preference
const userPrefs = storageStore.getJSONReactive('preferences', {
  theme: 'light',
  language: 'en'
})

// Automatically persisted when changed
userPrefs.value.theme = 'dark'
```

### 4. Cross-tab Synchronization

Use watchers for cross-tab synchronization:

```typescript
// Watch for auth changes in other tabs
const cleanup = authStore.watchAuthChanges()

// Cleanup when component unmounts
onUnmounted(cleanup)
```

## API Reference

### Storage Store Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `init()` | Initialize store (called automatically) | `void` |
| `getItem(key)` | Get string value | `string \| null` |
| `setItem(key, value)` | Set string value | `boolean` |
| `removeItem(key)` | Remove item | `boolean` |
| `clear()` | Clear all items | `boolean` |
| `getJSON<T>(key)` | Get parsed JSON value | `T \| null` |
| `setJSON(key, value)` | Set JSON value | `boolean` |
| `getReactive(key, default?)` | Get reactive string value | `ComputedRef<T>` |
| `getJSONReactive<T>(key, default?)` | Get reactive JSON value | `ComputedRef<T>` |
| `watchStorage(callback)` | Watch storage changes | `() => void` |

### Auth Store Properties

| Property | Type | Description |
|----------|------|-------------|
| `token` | `Ref<string \| null>` | Authentication token |
| `user` | `Ref<User \| null>` | User data |
| `isAuthenticated` | `Ref<boolean>` | Authentication status |
| `isLoading` | `Ref<boolean>` | Loading state |
| `lastActivity` | `Ref<number \| null>` | Last activity timestamp |
| `isTokenExpired` | `ComputedRef<boolean>` | Token expiration status |
| `shouldRefreshToken` | `ComputedRef<boolean>` | Should refresh token |

### Auth Store Methods

| Method | Description |
|--------|-------------|
| `setAuthData(token, user)` | Set authentication data |
| `updateUser(userData)` | Update user data |
| `updateLastActivity()` | Update activity timestamp |
| `clearAuthState()` | Clear all auth data |
| `getValidToken()` | Get valid token or null |
| `isSessionValid()` | Check session validity |
| `logout()` | Logout user |

## Troubleshooting

### Common Issues

1. **Store not initialized**: Make sure the plugin is loaded properly
2. **SSR hydration errors**: Use `import.meta.client` checks appropriately
3. **Missing reactivity**: Ensure you're using the reactive getters
4. **Cross-tab sync not working**: Check that the storage event listener is active

### Debug Mode

Enable debug logging by setting localStorage debug flag:

```typescript
if (import.meta.client) {
  localStorage.setItem('debug:storage', 'true')
}
```

## Performance Considerations

- **Caching**: Values are cached in memory for faster access
- **Batching**: Multiple operations are batched when possible
- **Lazy Loading**: Stores are only initialized when needed
- **Memory Management**: Event listeners are properly cleaned up

## Security Notes

- **Token Storage**: Tokens are stored in localStorage and cookies
- **XSS Protection**: Always sanitize data before storage
- **CSRF Protection**: Use secure cookies for sensitive data
- **Data Validation**: Validate data when reading from storage

## Future Enhancements

Planned improvements for the storage system:

1. **Encryption**: Optional encryption for sensitive data
2. **Compression**: Automatic compression for large objects
3. **Offline Support**: Better offline/online state handling
4. **Storage Quotas**: Automatic quota management
5. **Migration Tools**: Automated migration utilities
