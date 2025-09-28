// Secure authentication functions that use API routes instead of direct Supabase calls
import { ApiClient } from './api-client'



// Cache for user profile to reduce API calls
let profileCache: { profile: any; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCurrentUser() {
  try {
    // Check cache first
    if (profileCache && Date.now() - profileCache.timestamp < CACHE_DURATION) {
      return profileCache.profile
    }

    const profile = await ApiClient.getCurrentUser()
    
    // Update cache
    if (profile) {
      profileCache = {
        profile,
        timestamp: Date.now()
      }
    }

    return profile
  } catch (error) {
    console.error('Error getting current user:', error)
    profileCache = null
    return null
  }
}

export function clearUserCache() {
  profileCache = null
}

export async function signIn(email: string, password: string) {
  try {
    const result = await ApiClient.signIn(email, password)
    clearUserCache() // Clear cache to get fresh user data
    
    // No direct supabase usage here (remove supabase.auth.refreshSession)
    // If session refresh is needed, handle it via ApiClient or on the server

    return { data: result, error: null }
  } catch (error: any) {
    return { data: null, error: { message: error.message } }
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const result = await ApiClient.signUp(email, password, fullName)
    clearUserCache() // Clear cache to get fresh user data
    return { data: result, error: null }
  } catch (error: any) {
    return { data: null, error: { message: error.message } }
  }
}

export async function signOut() {
  try {
    await ApiClient.signOut()
    clearUserCache()
    return { error: null }
  } catch (error: any) {
    return { error: { message: error.message } }
  }
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    user: 1,
    staff: 2,
    admin: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}