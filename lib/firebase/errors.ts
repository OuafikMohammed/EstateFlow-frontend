/**
 * Firebase Error Handler and Utility Functions
 */

export enum FirebaseErrorCode {
  AUTH_EMAIL_ALREADY_IN_USE = "auth/email-already-in-use",
  AUTH_INVALID_EMAIL = "auth/invalid-email",
  AUTH_OPERATION_NOT_ALLOWED = "auth/operation-not-allowed",
  AUTH_WEAK_PASSWORD = "auth/weak-password",
  AUTH_USER_DISABLED = "auth/user-disabled",
  AUTH_USER_NOT_FOUND = "auth/user-not-found",
  AUTH_WRONG_PASSWORD = "auth/wrong-password",
  AUTH_TOO_MANY_REQUESTS = "auth/too-many-requests",
}

export class FirebaseError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = "FirebaseError"
  }
}

/**
 * Parse Firebase auth error and return user-friendly message
 */
export const parseAuthError = (error: any): string => {
  const firebaseError = error as any

  const errorMap: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered. Please use a different email or try logging in.",
    "auth/invalid-email": "The email address is not valid. Please check and try again.",
    "auth/operation-not-allowed": "This operation is not allowed. Please contact support.",
    "auth/weak-password": "The password is too weak. Please use at least 6 characters with a mix of letters and numbers.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email. Please check or create a new account.",
    "auth/wrong-password": "The password is incorrect. Please try again.",
    "auth/too-many-requests": "Too many failed login attempts. Please try again later.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
  }

  return errorMap[firebaseError.code] || "An authentication error occurred. Please try again."
}

/**
 * Parse Firebase database error and return user-friendly message
 */
export const parseDatabaseError = (error: any): string => {
  const message = error?.message || String(error)

  const errorMap: Record<string, string> = {
    "permission-denied": "You do not have permission to perform this action.",
    "not-found": "The resource was not found.",
    "already-exists": "This resource already exists.",
    "invalid-argument": "Invalid data was provided. Please check and try again.",
    "internal": "An internal server error occurred. Please try again later.",
    "unavailable": "The service is temporarily unavailable. Please try again later.",
    "unauthenticated": "You must be logged in to perform this action.",
  }

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key)) {
      return value
    }
  }

  return "An error occurred. Please try again."
}

/**
 * Global error handler for Firebase operations
 */
export const handleFirebaseError = (error: any): { code: string; message: string } => {
  if (error instanceof FirebaseError) {
    return {
      code: error.code,
      message: error.message,
    }
  }

  const code = error?.code || "unknown"
  let message = error?.message || "An unexpected error occurred"

  // Determine error type and parse accordingly
  if (code.startsWith("auth/")) {
    message = parseAuthError(error)
  } else if (code.startsWith("firestore/")) {
    message = parseDatabaseError(error)
  } else if (message.includes("Failed to")) {
    message = parseDatabaseError(error)
  }

  return { code, message }
}

/**
 * Validation utilities
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long" }
  }
  return { isValid: true }
}

/**
 * Retry logic for failed operations
 */
export const retryAsync = async <T,>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> => {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}

/**
 * Debounce function for search operations
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

/**
 * Throttle function for frequent operations
 */
export const throttle = <T extends (...args: any[]) => any>(fn: T, limit: number) => {
  let inThrottle: boolean
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }) as T
}
