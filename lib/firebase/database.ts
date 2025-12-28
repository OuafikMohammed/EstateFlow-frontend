import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
  addDoc,
} from "firebase/firestore"
import { db } from "./config"

/**
 * Generic CRUD operations for Firestore
 */

// Types
export interface FirestoreDocument {
  id: string
  [key: string]: any
}

/**
 * Get a single document by ID
 */
export const getDocumentById = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, documentId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T
    }
    return null
  } catch (error: any) {
    throw new Error(`Failed to get document: ${error.message}`)
  }
}

/**
 * Get all documents from a collection with optional filters and sorting
 */
export const getDocuments = async <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> => {
  try {
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as T[]
  } catch (error: any) {
    throw new Error(`Failed to get documents: ${error.message}`)
  }
}

/**
 * Create a new document with auto-generated ID
 */
export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error: any) {
    throw new Error(`Failed to create document: ${error.message}`)
  }
}

/**
 * Create or overwrite a document with a specific ID
 */
export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: T,
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId)
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error: any) {
    throw new Error(`Failed to set document: ${error.message}`)
  }
}

/**
 * Update a document
 */
export const updateDocument = async <T extends Partial<DocumentData>>(
  collectionName: string,
  documentId: string,
  data: T,
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    throw new Error(`Failed to update document: ${error.message}`)
  }
}

/**
 * Delete a document
 */
export const deleteDocument = async (collectionName: string, documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId)
    await deleteDoc(docRef)
  } catch (error: any) {
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

/**
 * Batch write operations
 */
export const batchWrite = async (
  operations: Array<{ type: "set" | "update" | "delete"; collection: string; id: string; data?: any }>,
): Promise<void> => {
  try {
    const batch = writeBatch(db)

    for (const op of operations) {
      const docRef = doc(db, op.collection, op.id)
      if (op.type === "set") {
        batch.set(docRef, {
          ...op.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      } else if (op.type === "update") {
        batch.update(docRef, {
          ...op.data,
          updatedAt: new Date(),
        })
      } else if (op.type === "delete") {
        batch.delete(docRef)
      }
    }

    await batch.commit()
  } catch (error: any) {
    throw new Error(`Batch write failed: ${error.message}`)
  }
}

/**
 * Real-time listener for a collection
 */
export const subscribeToCollection = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (docs: T[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  try {
    const q = query(collection(db, collectionName), ...constraints)
    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as T[]
        callback(docs)
      },
      (error) => {
        if (onError) {
          onError(new Error(`Failed to subscribe to collection: ${error.message}`))
        }
      },
    )
  } catch (error: any) {
    throw new Error(`Failed to subscribe: ${error.message}`)
  }
}

/**
 * Real-time listener for a specific document
 */
export const subscribeToDocument = <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  callback: (doc: T | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  try {
    const docRef = doc(db, collectionName, documentId)
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const document = {
            id: snapshot.id,
            ...snapshot.data(),
          } as unknown as T
          callback(document)
        } else {
          callback(null)
        }
      },
      (error) => {
        if (onError) {
          onError(new Error(`Failed to subscribe to document: ${error.message}`))
        }
      },
    )
  } catch (error: any) {
    throw new Error(`Failed to subscribe: ${error.message}`)
  }
}
