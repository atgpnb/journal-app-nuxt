/**
 * Production-Safe Navigation Utilities
 * 
 * Handles navigation issues that can occur in production environments
 */

export const safeNavigateTo = async (path: string, options: { replace?: boolean } = {}) => {
  if (import.meta.client) {
    // Client-side navigation
    try {
      await navigateTo(path, { replace: options.replace || false })
    } catch (error) {
      console.warn('NavigateTo failed, using window.location:', error)
      if (options.replace) {
        window.location.replace(path)
      } else {
        window.location.href = path
      }
    }
  } else {
    // Server-side navigation
    return navigateTo(path, { replace: options.replace || false })
  }
}

export const forceRedirectToDashboard = () => {
  if (import.meta.client) {
    // Give cookies time to be set, then redirect
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 100)
  }
}
