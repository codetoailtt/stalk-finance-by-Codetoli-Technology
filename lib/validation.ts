import { z } from 'zod'

// ------------------------------
// Common validation schemas
// ------------------------------
export const emailSchema = z.string().email('Invalid email address')

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')

export const uuidSchema = z.string().uuid('Invalid UUID')

// ------------------------------
// Query validation schemas
// ------------------------------
export const createQuerySchema = z.object({
  service_id: z.union([uuidSchema, z.null()]).optional(),
  other_service: z.union([z.string().max(200), z.null()]).optional(),
  store_id: z.union([uuidSchema, z.literal('other')]),
  amount: z.number().positive().optional(),
  tenure_months: z.number().min(1).max(60).optional(),
  timeline: z.string().max(100).optional(),
  purpose: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  terms_accepted: z.boolean(),
  terms_accepted_at: z.string().optional(),
  other_store: z
    .object({
      name: z.string().min(1).max(100),
      owner_email: emailSchema,
      owner_phone: phoneSchema,
      address: z.string().min(1).max(500),
    })
    .optional(),
})

export const updateQuerySchema = z.object({
  status: z
    .enum(['pending', 'under_review', 'approved', 'rejected', 'completed'])
    .optional(),
  note: z.string().max(1000).optional(),
})

// ------------------------------
// Store validation schemas
// ------------------------------
export const createStoreSchema = z.object({
  name: z.string().min(1).max(100),
  owner_name: z.string().min(1).max(100),
  owner_email: emailSchema,
  owner_phone: phoneSchema.optional(),
  address: z.string().max(500).optional(),
})

// ------------------------------
// User validation schemas
// ------------------------------
export const updateUserSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  role: z.enum(['user', 'staff', 'admin']).optional(),
})

// ------------------------------
// File validation helpers
// ------------------------------
export const validateFileType = (mimeType: string): boolean => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  return allowedTypes.includes(mimeType)
}

export const validateFileSize = (
  size: number,
  maxSizeMB: number = 10
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

// ------------------------------
// Sanitization helpers
// ------------------------------
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .replace(/(;|--)/g, '') // Remove SQL comment patterns
    .replace(/\\/g, '') // Remove backslashes
}

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/(;|--)/g, '') // Remove SQL comment patterns
    .replace(/\\/g, '') // Remove backslashes
}

export const sanitizeSQLInput = (input: string): string => {
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/(;|--)/g, '') // Remove semicolons & double dash
    .replace(/\\/g, '') // Remove backslashes
    .replace(/\x00/g, '') // Remove null bytes
    .trim()
}

// ------------------------------
// UUID validation helper
// ------------------------------
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
