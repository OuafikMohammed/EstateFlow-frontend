/**
 * Property Validation Schemas
 * Using Zod for runtime type safety and validation
 */

import { z } from 'zod'

/**
 * Enum types for properties
 */
const PropertyTypeEnum = z.enum([
  'house',
  'condo',
  'townhouse',
  'commercial',
  'land',
  'multi_family',
  'apartment',
])

const PropertyStatusEnum = z.enum([
  'available',
  'under_contract',
  'sold',
  'expired',
  'withdrawn',
])

const TransactionTypeEnum = z.enum([
  'sale',
  'lease',
  'rent',
])

/**
 * Create Property Schema
 * Validates input for creating a new property
 */
export const createPropertySchema = z.object({
  type: PropertyTypeEnum.describe('Property type (house, condo, townhouse, etc.)'),
  transactionType: TransactionTypeEnum.describe('Transaction type (sale, lease, rent)'),
  price: z
    .number()
    .positive('Price must be greater than 0')
    .describe('Property price'),
  size: z
    .number()
    .positive('Size must be greater than 0')
    .optional()
    .describe('Square footage'),
  bedrooms: z
    .number()
    .int()
    .nonnegative('Bedrooms cannot be negative')
    .describe('Number of bedrooms'),
  bathrooms: z
    .number()
    .nonnegative('Bathrooms cannot be negative')
    .describe('Number of bathrooms'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .describe('Property description'),
  status: PropertyStatusEnum.describe('Property listing status'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .describe('Property street address'),
  city: z
    .string()
    .min(1, 'City is required')
    .describe('City'),
  country: z
    .string()
    .optional()
    .describe('Country'),
  zipCode: z
    .string()
    .optional()
    .describe('ZIP code'),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional()
    .describe('Latitude coordinate'),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional()
    .describe('Longitude coordinate'),
  images: z
    .array(z.string().url())
    .min(3, 'At least 3 images are required')
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .describe('Property images (URLs)'),
  amenities: z
    .array(z.string())
    .optional()
    .describe('Property amenities'),
})

/**
 * Update Property Schema
 * All fields are optional for partial updates
 */
export const updatePropertySchema = z.object({
  type: PropertyTypeEnum.optional(),
  transactionType: TransactionTypeEnum.optional(),
  price: z
    .number()
    .positive('Price must be greater than 0')
    .optional(),
  size: z
    .number()
    .positive('Size must be greater than 0')
    .optional(),
  bedrooms: z
    .number()
    .int()
    .nonnegative('Bedrooms cannot be negative')
    .optional(),
  bathrooms: z
    .number()
    .nonnegative('Bathrooms cannot be negative')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .optional(),
  status: PropertyStatusEnum.optional(),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .optional(),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),
  images: z
    .array(z.string().url())
    .min(3, 'At least 3 images are required')
    .max(10, 'Maximum 10 images allowed')
    .optional(),
  amenities: z
    .array(z.string())
    .optional(),
})

/**
 * Query Parameters Schema
 * Validates pagination and filtering parameters
 */
export const propertyQuerySchema = z.object({
  page: z
    .number()
    .int()
    .positive()
    .default(1)
    .describe('Page number for pagination'),
  limit: z
    .number()
    .int()
    .positive()
    .max(50)
    .default(50)
    .describe('Number of items per page (max 50)'),
  search: z
    .string()
    .optional()
    .describe('Search query for address, description, etc.'),
  type: PropertyTypeEnum.optional().describe('Filter by property type'),
  status: PropertyStatusEnum.optional().describe('Filter by listing status'),
  transactionType: TransactionTypeEnum.optional().describe('Filter by transaction type'),
  minPrice: z
    .number()
    .nonnegative()
    .optional()
    .describe('Minimum price filter'),
  maxPrice: z
    .number()
    .nonnegative()
    .optional()
    .describe('Maximum price filter'),
  sortBy: z
    .enum(['created_at', 'updated_at', 'price', 'size', 'bedrooms', 'address'])
    .default('created_at')
    .describe('Field to sort by'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc')
    .describe('Sort order'),
})

/**
 * Type exports for TypeScript
 */
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type PropertyQuery = z.infer<typeof propertyQuerySchema>
export type PropertyType = z.infer<typeof PropertyTypeEnum>
export type PropertyStatus = z.infer<typeof PropertyStatusEnum>
export type TransactionType = z.infer<typeof TransactionTypeEnum>
