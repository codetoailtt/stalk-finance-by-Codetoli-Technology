// Simple in-memory rate limiting
// In production, use Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs
    }
  }

  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime
    }
  }

  // Increment count
  entry.count++
  rateLimitMap.set(identifier, entry)

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  })
}, 5 * 60 * 1000) // Clean up every 5 minutes