/**
 * Storage Plugin
 * 
 * Initializes storage and auth stores on client side
 * Also handles migration from old storage system
 */

export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const storageStore = useStorageStore()
    const authStore = useAuthStore()
    
    // Initialize storage store
    storageStore.init()
    
    // Initialize auth state from localStorage
    authStore.initAuthState()
    
    // Run migration if needed (only on first load)
    const { runCompleteMigration } = await import('~/utils/migration')
    await runCompleteMigration()
    
    // Watch for auth changes from other tabs
    authStore.watchAuthChanges()
  }
})
