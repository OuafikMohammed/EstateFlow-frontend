import { z } from "zod"

/**
 * Client Status Types
 */
export const ClientStatusEnum = z.enum(["hot", "warm", "cold"])
export type ClientStatus = z.infer<typeof ClientStatusEnum>

/**
 * Property Type Enum
 */
export const PropertyTypeEnum = z.enum([
  "apartment",
  "house",
  "condo",
  "townhouse",
  "commercial",
  "land",
  "multi_family",
])
export type PropertyType = z.infer<typeof PropertyTypeEnum>

/**
 * Client Lead Source
 */
export const SourceEnum = z.enum([
  "referral",
  "website",
  "social_media",
  "phone_call",
  "email",
  "agent_contact",
  "walk_in",
  "other",
])
export type Source = z.infer<typeof SourceEnum>

/**
 * Create Client Schema
 */
export const CreateClientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"),
  email: z
    .string()
    .email("Invalid email address"),
  budget_min: z
    .number()
    .int("Budget must be an integer")
    .positive("Minimum budget must be positive")
    .optional()
    .nullable(),
  budget_max: z
    .number()
    .int("Budget must be an integer")
    .positive("Maximum budget must be positive")
    .optional()
    .nullable(),
  preferred_type: z
    .array(PropertyTypeEnum)
    .min(1, "Select at least one property type")
    .optional(),
  preferred_location: z
    .array(z.string().min(1))
    .optional(),
  bedrooms: z
    .number()
    .int("Bedrooms must be an integer")
    .nonnegative()
    .optional()
    .nullable(),
  status: ClientStatusEnum.default("warm"),
  source: SourceEnum.optional(),
  notes: z
    .string()
    .max(5000, "Notes must be less than 5000 characters")
    .optional()
    .nullable(),
})

export type CreateClientInput = z.infer<typeof CreateClientSchema>

/**
 * Update Client Schema
 */
export const UpdateClientSchema = CreateClientSchema.partial().extend({
  id: z.string().uuid("Invalid client ID"),
})

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>

/**
 * Client Response Schema
 */
export const ClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  budget_min: z.number().nullable(),
  budget_max: z.number().nullable(),
  preferred_type: z.array(z.string()).nullable(),
  preferred_location: z.array(z.string()).nullable(),
  bedrooms: z.number().nullable(),
  status: ClientStatusEnum,
  source: z.string().optional().nullable(),
  notes: z.string().nullable(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
})

export type Client = z.infer<typeof ClientSchema>

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(10),
})

export type Pagination = z.infer<typeof PaginationSchema>

/**
 * Clients Query Filters
 */
export const ClientsQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  status: ClientStatusEnum.optional(),
  sortBy: z.enum(["created_at", "name", "status"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type ClientsQuery = z.infer<typeof ClientsQuerySchema>

/**
 * API Response Types
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  ApiResponseSchema(
    z.object({
      items: z.array(dataSchema),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      pages: z.number(),
    })
  )

/**
 * Typed API Responses
 */
export type ApiResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}>

export type ClientResponse = Client
export type ClientsResponse = PaginatedResponse<Client>
export type CreateClientResponse = ApiResponse<Client>
export type UpdateClientResponse = ApiResponse<Client>
export type DeleteClientResponse = ApiResponse<{ id: string }>
