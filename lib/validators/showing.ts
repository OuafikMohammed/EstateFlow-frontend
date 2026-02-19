import { z } from "zod"

/**
 * Showing Status Enum
 */
export const ShowingStatusEnum = z.enum(["scheduled", "completed", "cancelled"])
export type ShowingStatus = z.infer<typeof ShowingStatusEnum>

/**
 * Interest Level (1-5 scale)
 */
export const InterestLevelEnum = z.enum(["1", "2", "3", "4", "5"])
export type InterestLevel = z.infer<typeof InterestLevelEnum>

/**
 * Create Showing Schema
 */
export const CreateShowingSchema = z.object({
  property_id: z
    .string()
    .uuid("Invalid property ID"),
  client_id: z
    .string()
    .uuid("Invalid client ID"),
  agent_id: z
    .string()
    .uuid("Invalid agent ID")
    .optional(),
  scheduled_at: z
    .string()
    .datetime("Invalid datetime format"),
  status: ShowingStatusEnum.default("scheduled"),
  feedback: z
    .string()
    .max(5000, "Feedback must be less than 5000 characters")
    .optional()
    .nullable(),
  interest_level: InterestLevelEnum
    .optional()
    .nullable(),
})

export type CreateShowing = z.infer<typeof CreateShowingSchema>

/**
 * Update Showing Schema
 */
export const UpdateShowingSchema = CreateShowingSchema.partial()
export type UpdateShowing = z.infer<typeof UpdateShowingSchema>

/**
 * Showing Schema (Full showing object with joins)
 */
export const ShowingSchema = CreateShowingSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable().optional(),
  property: z.object({
    id: z.string().uuid(),
    title: z.string(),
    address: z.string(),
    price: z.number(),
  }).optional(),
  client: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }).optional(),
  agent: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
  }).optional(),
})

export type Showing = z.infer<typeof ShowingSchema>

/**
 * Query Schema for showing filters
 */
export const ShowingsQuerySchema = z.object({
  status: ShowingStatusEnum.optional(),
  agent_id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(10),
  sortBy: z
    .enum(["scheduled_at", "created_at", "status"])
    .default("scheduled_at"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

export type ShowingsQuery = z.infer<typeof ShowingsQuerySchema>

/**
 * Date Range Query Schema
 */
export const DateRangeQuerySchema = z.object({
  from_date: z.string().datetime("Invalid start date"),
  to_date: z.string().datetime("Invalid end date"),
  agent_id: z.string().uuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(10),
})

export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>

/**
 * Complete Showing Schema
 */
export const CompleteShowingSchema = z.object({
  id: z.string().uuid("Invalid showing ID"),
  feedback: z
    .string()
    .max(5000, "Feedback must be less than 5000 characters")
    .optional(),
  interest_level: InterestLevelEnum.optional(),
})

export type CompleteShowing = z.infer<typeof CompleteShowingSchema>

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(10),
})

export type Pagination = z.infer<typeof PaginationSchema>

/**
 * API Response Types
 */
export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

export type ShowingResponse = ApiResponse<Showing>

export type ShowingsResponse = ApiResponse<{
  items: Showing[]
  total: number
  page: number
  limit: number
  pages: number
}>

export type CreateShowingResponse = ApiResponse<Showing>
export type UpdateShowingResponse = ApiResponse<Showing>
export type CompleteShowingResponse = ApiResponse<Showing>
export type DeleteShowingResponse = ApiResponse<null>

/**
 * Paginated Response Type
 */
export type PaginatedResponse<T> = {
  success: true
  data: {
    items: T[]
    total: number
    page: number
    limit: number
    pages: number
  }
} | {
  success: false
  error: string
}
