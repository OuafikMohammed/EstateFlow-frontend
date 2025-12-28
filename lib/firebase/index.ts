/**
 * Firebase Barrel Export
 * Import all Firebase utilities from a single location
 */

// Authentication
export { auth, db, storage } from './config'
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  subscribeToAuthStateChange,
  getAuthToken,
  type AuthUser,
} from './auth'

// Database Operations
export {
  getDocumentById,
  getDocuments,
  createDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  batchWrite,
  subscribeToCollection,
  subscribeToDocument,
  type FirestoreDocument,
} from './database'

// Domain Services
export {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  subscribeToUsers,
  getPropertyById,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  subscribeToProperties,
  getLeadById,
  getAllLeads,
  createLead,
  updateLead,
  deleteLead,
  subscribeToLeads,
  getTransactionById,
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  subscribeToTransactions,
  type User,
  type Property,
  type Lead,
  type Transaction,
} from './services'

// Error Handling
export {
  FirebaseErrorCode,
  FirebaseError,
  parseAuthError,
  parseDatabaseError,
  handleFirebaseError,
  validateEmail,
  validatePassword,
  retryAsync,
  debounce,
  throttle,
} from './errors'
