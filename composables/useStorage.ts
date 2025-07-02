/**
 * Storage Composable
 * 
 * Provides a simple interface to the Pinia storage store
 * This maintains backward compatibility with the old storage utilities
 */

import { useStorageStore } from '~/stores/storage'

export const useStorage = () => {
  const storageStore = useStorageStore()

  return {
    // Direct access to store methods
    ...storageStore,
    
    // Backward compatibility aliases
    isLocalStorageAvailable: storageStore.checkAvailability,
    getLocalStorageItem: storageStore.getItem,
    setLocalStorageItem: storageStore.setItem,
    removeLocalStorageItem: storageStore.removeItem,
    clearLocalStorage: storageStore.clear,
    getLocalStorageJSON: storageStore.getJSON,
    setLocalStorageJSON: storageStore.setJSON
  }
}
