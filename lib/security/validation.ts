/**
 * Input Validation & Schema Enforcement Module
 * OWASP API6:2023 - Unrestricted Access to Sensitive Business Flows
 * OWASP A01:2021 - Broken Access Control
 *
 * Provides schema validation using Zod for:
 * - Type safety
 * - Runtime validation
 * - Automatic error messages
 */

import { z, ZodSchema, ZodError } from 'zod'
import { NextResponse } from 'next/server'

/**
 * Validation result type
 */
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
}

/**
 * Validate request body against a Zod schema
 * @param data - Data to validate
 * @param schema - Zod schema
 * @returns Validation result
 */
export function validateRequest<T>(
  data: unknown,
  schema: ZodSchema
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData as T }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach(err => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return {
      success: false,
      errors: { _general: ['Validation failed'] },
    }
  }
}

/**
 * Create validation error response
 * @param errors - Validation errors
 * @returns NextResponse with 400 status
 */
export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      error: 'Validation Error',
      details: errors,
    },
    { status: 400 }
  )
}

/**
 * Schema definitions for common entities
 */
export const Schemas = {
  // Authentication schemas
  loginRequest: z.object({
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),

  signupRequest: z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z)')
      .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character (!@#$%^&*)'),
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(255, 'Full name must not exceed 255 characters')
      .trim(),
    companyName: z
      .string()
      .min(1, 'Company name is required')
      .min(2, 'Company name must be at least 2 characters')
      .max(255, 'Company name must not exceed 255 characters')
      .trim(),
  }),

  // Property schemas
  propertyCreate: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title must not exceed 255 characters')
      .trim(),
    description: z.string().max(5000, 'Description must not exceed 5000 characters').optional(),
    propertyType: z.enum(['house', 'condo', 'townhouse', 'commercial', 'land', 'multi_family']),
    price: z.number().positive('Price must be positive').optional(),
    address: z.string().min(5, 'Address is required').trim(),
    city: z.string().min(2, 'City is required').trim(),
    state: z.string().min(2, 'State is required').trim(),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().nonnegative().optional(),
    squareFeet: z.number().int().positive().optional(),
  }),

  propertyUpdate: z.object({
    title: z.string().min(3).max(255).trim().optional(),
    description: z.string().max(5000).optional(),
    propertyType: z.enum(['house', 'condo', 'townhouse', 'commercial', 'land', 'multi_family']).optional(),
    price: z.number().positive().optional(),
    address: z.string().min(5).trim().optional(),
    city: z.string().min(2).trim().optional(),
    state: z.string().min(2).trim().optional(),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
    status: z.enum(['available', 'under_contract', 'sold', 'expired', 'withdrawn']).optional(),
  }),

  // Lead schemas
  leadCreate: z.object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(100, 'First name must not exceed 100 characters')
      .trim(),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(100, 'Last name must not exceed 100 characters')
      .trim(),
    email: z.string().email('Invalid email format').optional(),
    phone: z
      .string()
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/i, 'Invalid phone format')
      .optional(),
    notes: z.string().max(5000).optional(),
  }).refine(
    obj => obj.email || obj.phone,
    'Either email or phone is required'
  ),

  leadUpdate: z.object({
    firstName: z.string().min(2).max(100).trim().optional(),
    lastName: z.string().min(2).max(100).trim().optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/i).optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost']).optional(),
    notes: z.string().max(5000).optional(),
  }),

  // Client schemas
  clientCreate: z.object({
    firstName: z.string().min(2).max(100).trim(),
    lastName: z.string().min(2).max(100).trim(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/i).optional(),
  }).refine(
    obj => obj.email || obj.phone,
    'Either email or phone is required'
  ),

  // Query parameters
  listQuery: z.object({
    page: z.preprocess(
      val => (typeof val === 'string' ? parseInt(val, 10) : val),
      z.number().int().positive().default(1)
    ),
    limit: z.preprocess(
      val => (typeof val === 'string' ? parseInt(val, 10) : val),
      z.number().int().min(1).max(100).default(20)
    ),
    sortBy: z.string().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
}

/**
 * Type-safe schema getter with type inference
 */
export function getSchema<K extends keyof typeof Schemas>(key: K) {
  return Schemas[key]
}
