/**
 * Migration utilities for transitioning from old storage to Pinia stores
 */

import { useStorageStore } from '~/stores/storage'
import { useAuthStore } from '~/stores/auth'
import { AUTH_CONFIG } from '~/constants/auth'

/**
 * Migrate existing localStorage data to Pinia stores
 * This should be called once during the migration process
 */
export const migrateStorageData = () => {
  if (!import.meta.client) return

  const storageStore = useStorageStore()
  const authStore = useAuthStore()

  console.log('🔄 Starting storage migration...')

  try {
    // Check if we have existing auth data in localStorage
    const existingToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    const existingUserStr = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER)
    const existingActivity = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY)

    if (existingToken && existingUserStr) {
      try {
        const existingUser = JSON.parse(existingUserStr)
        
        // Verify the data is valid
        if (existingUser && typeof existingUser === 'object' && existingUser.id) {
          // Initialize auth store with existing data
          authStore.setAuthData(existingToken, existingUser)
          
          // Set last activity if available
          if (existingActivity) {
            const activityTime = parseInt(existingActivity, 10)
            if (!isNaN(activityTime)) {
              // Use the storage store to set the activity directly
              storageStore.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, existingActivity)
            }
          }
          
          console.log('✅ Auth data migrated successfully')
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse existing user data:', error)
      }
    }

    // Migrate any other custom localStorage keys if needed
    // Add custom migration logic here for your specific keys

    console.log('✅ Storage migration completed')
  } catch (error) {
    console.error('❌ Storage migration failed:', error)
  }
}

/**
 * Check if migration is needed
 */
export const needsMigration = (): boolean => {
  if (!import.meta.client) return false

  try {
    // Check if we have old localStorage data but no store data
    const hasOldToken = !!localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    const authStore = useAuthStore()
    const hasStoreToken = !!authStore.token

    return hasOldToken && !hasStoreToken
  } catch (error) {
    console.warn('Failed to check migration status:', error)
    return false
  }
}

/**
 * Clean up old storage after successful migration
 * Call this after verifying the migration was successful
 */
export const cleanupOldStorage = () => {
  if (!import.meta.client) return

  console.log('🧹 Cleaning up old storage...')

  try {
    // Remove any deprecated keys that are no longer used
    const deprecatedKeys = [
      // Add any old keys that are no longer needed
      'old_auth_token',
      'deprecated_user_data',
      // The current keys are still used for compatibility
    ]

    deprecatedKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        console.log(`🗑️ Removed deprecated key: ${key}`)
      }
    })

    console.log('✅ Cleanup completed')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

/**
 * Verify that the migration was successful
 */
export const verifyMigration = (): boolean => {
  if (!import.meta.client) return true

  try {
    const authStore = useAuthStore()
    const storageStore = useStorageStore()

    // Check that auth store has expected data structure
    const hasValidAuthState = authStore.isAuthenticated ? 
      !!(authStore.token && authStore.user && authStore.user.id) : true

    // Check that storage store is properly initialized
    const isStorageReady = storageStore.isAvailable

    const isValid = hasValidAuthState && isStorageReady

    if (isValid) {
      console.log('✅ Migration verification passed')
    } else {
      console.warn('⚠️ Migration verification failed')
    }

    return isValid
  } catch (error) {
    console.error('❌ Migration verification error:', error)
    return false
  }
}

/**
 * Complete migration process
 * This runs the full migration workflow
 */
export const runCompleteMigration = async () => {
  if (!import.meta.client) return

  console.log('🚀 Starting complete migration process...')

  try {
    // Step 1: Check if migration is needed
    if (!needsMigration()) {
      console.log('ℹ️ No migration needed')
      return
    }

    // Step 2: Run the migration
    migrateStorageData()

    // Step 3: Wait a bit for stores to settle
    await new Promise(resolve => setTimeout(resolve, 100))

    // Step 4: Verify the migration
    if (verifyMigration()) {
      // Step 5: Clean up if verification passed
      cleanupOldStorage()
      console.log('🎉 Migration completed successfully!')
    } else {
      console.error('💥 Migration verification failed - keeping old data as backup')
    }
  } catch (error) {
    console.error('💥 Complete migration failed:', error)
  }
}
