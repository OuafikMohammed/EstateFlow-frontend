import { QueryConstraint } from "firebase/firestore"
import {
  getDocumentById,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
} from "./database"

// Type definitions based on your schema
export interface User {
  id: string
  email: string
  password?: string
  roles: string[]
  firstName: string
  lastName: string
  createdAt: Date
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  images: string[]
  bedrooms: number
  bathrooms: number
  squareFeet: number
  type: "apartment" | "house" | "villa" | "commercial"
  status: "available" | "sold" | "rented"
  agentId: string
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  propertyId?: string
  status: "new" | "contacted" | "qualified" | "converted"
  notes?: string
  agentId: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  propertyId: string
  buyerId: string
  sellerId: string
  amount: number
  date: Date
  type: "sale" | "rental"
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface Showing {
  id: string
  property_id: string
  agent_id: string
  client_id: string
  scheduled_date: Date
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  notes?: string
  created_at: Date
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  type: "buyer" | "renter" | "investor"
  budget_min?: number
  budget_max?: number
  preferred_locations?: string[]
  preferred_property_types?: string[]
  lead_source?: string
  properties_viewed?: string[]
  properties_favorited?: string[]
  agent_assigned?: string
  status: "active" | "inactive" | "closed_deal"
  created_at: Date
}

// USER OPERATIONS
export const getUserById = (userId: string) => getDocumentById<User>("users", userId)

export const getAllUsers = (constraints?: QueryConstraint[]) => getDocuments<User>("users", constraints)

export const createUser = (userData: Omit<User, "id">) => createDocument("users", userData)

export const updateUser = (userId: string, userData: Partial<User>) => updateDocument("users", userId, userData)

export const deleteUser = (userId: string) => deleteDocument("users", userId)

export const subscribeToUsers = (
  callback: (users: User[]) => void,
  constraints?: QueryConstraint[],
  onError?: (error: Error) => void,
) => subscribeToCollection("users", constraints, callback, onError)

// PROPERTY OPERATIONS
export const getPropertyById = (propertyId: string) => getDocumentById<Property>("properties", propertyId)

export const getAllProperties = (constraints?: QueryConstraint[]) => getDocuments<Property>("properties", constraints)

export const createProperty = (propertyData: Omit<Property, "id">) =>
  createDocument("properties", propertyData)

export const updateProperty = (propertyId: string, propertyData: Partial<Property>) =>
  updateDocument("properties", propertyId, propertyData)

export const deleteProperty = (propertyId: string) => deleteDocument("properties", propertyId)

export const subscribeToProperties = (
  callback: (properties: Property[]) => void,
  constraints?: QueryConstraint[],
  onError?: (error: Error) => void,
) => subscribeToCollection("properties", constraints, callback, onError)

// LEAD OPERATIONS
export const getLeadById = (leadId: string) => getDocumentById<Lead>("leads", leadId)

export const getAllLeads = (constraints?: QueryConstraint[]) => getDocuments<Lead>("leads", constraints)

export const createLead = (leadData: Omit<Lead, "id">) => createDocument("leads", leadData)

export const updateLead = (leadId: string, leadData: Partial<Lead>) =>
  updateDocument("leads", leadId, leadData)

export const deleteLead = (leadId: string) => deleteDocument("leads", leadId)

export const subscribeToLeads = (
  callback: (leads: Lead[]) => void,
  constraints?: QueryConstraint[],
  onError?: (error: Error) => void,
) => subscribeToCollection("leads", constraints, callback, onError)

// TRANSACTION OPERATIONS
export const getTransactionById = (transactionId: string) =>
  getDocumentById<Transaction>("transactions", transactionId)

export const getAllTransactions = (constraints?: QueryConstraint[]) =>
  getDocuments<Transaction>("transactions", constraints)

export const createTransaction = (transactionData: Omit<Transaction, "id">) =>
  createDocument("transactions", transactionData)

export const updateTransaction = (transactionId: string, transactionData: Partial<Transaction>) =>
  updateDocument("transactions", transactionId, transactionData)

export const deleteTransaction = (transactionId: string) => deleteDocument("transactions", transactionId)

export const subscribeToTransactions = (
  callback: (transactions: Transaction[]) => void,
  constraints?: QueryConstraint[],
  onError?: (error: Error) => void,
) => subscribeToCollection("transactions", constraints, callback, onError)

// SHOWING OPERATIONS
export const getShowingById = (showingId: string) => getDocumentById<Showing>("showings", showingId)

export const getAllShowings = (constraints?: QueryConstraint[]) =>
  getDocuments<Showing>("showings", constraints)

export const createShowing = (showingData: Omit<Showing, "id">) => createDocument("showings", showingData)

export const updateShowing = (showingId: string, showingData: Partial<Showing>) =>
  updateDocument("showings", showingId, showingData)

export const deleteShowing = (showingId: string) => deleteDocument("showings", showingId)

export const subscribeToShowings = (
  callback: (showings: Showing[]) => void,
  constraints?: QueryConstraint[],
  onError?: (error: Error) => void,
) => subscribeToCollection("showings", constraints, callback, onError)

// CLIENT OPERATIONS
export const getClientById = (clientId: string) => getDocumentById<Client>("clients", clientId)

export const getAllClients = (constraints?: QueryConstraint[]) => getDocuments<Client>("clients", constraints)

export const createClient = (clientData: Omit<Client, "id">) => createDocument("clients", clientData)

export const updateClient = (clientId: string, clientData: Partial<Client>) =>
  updateDocument("clients", clientId, clientData)

export const deleteClient = (clientId: string) => deleteDocument("clients", clientId)

export const subscribeToClients = (
  callback: (clients: Client[]) => void,
  constraints?: QueryConstraint[],
  onError?: (error: Error) => void,
) => subscribeToCollection("clients", constraints, callback, onError)
