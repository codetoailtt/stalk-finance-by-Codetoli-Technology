import { supabase } from './supabase'
import { type UserRole } from './types'

// Cache for user profile to reduce API calls
let profileCache: { profile: any; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCurrentUser() {
  try {
    // Check cache first
    if (profileCache && Date.now() - profileCache.timestamp < CACHE_DURATION) {
      return profileCache.profile
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      profileCache = null
      return null
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    staff: 2,
    admin: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}