import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { auth } from "./config"

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  try {
    // Enable persistence
    await setPersistence(auth, browserLocalPersistence)
    return await createUserWithEmailAndPassword(auth, email, password)
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`)
  }
}

/**
 * Sign in a user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    // Enable persistence
    await setPersistence(auth, browserLocalPersistence)
    return await signInWithEmailAndPassword(auth, email, password)
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`)
  }
}

/**
 * Sign out the current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`)
  }
}

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

/**
 * Listen to auth state changes
 */
export const subscribeToAuthStateChange = (callback: (user: AuthUser | null) => void): (() => void) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }
      callback(authUser)
    } else {
      callback(null)
    }
  })

  return unsubscribe
}

/**
 * Get auth token for API calls
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser
    if (user) {
      return await user.getIdToken()
    }
    return null
  } catch (error: any) {
    throw new Error(`Failed to get auth token: ${error.message}`)
  }
}
