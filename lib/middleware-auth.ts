// Enhanced middleware helper for authentication with better error handling
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try to get from cookie as fallback
      const tokenCookie = request.cookies.get('sb-access-token')
      if (!tokenCookie) {
        return { user: null, profile: null, error: 'No access token found' }
      }
      const accessToken = tokenCookie.value
      const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
      
      if (userError || !user) {
        return { user: null, profile: null, error: 'Invalid or expired token' }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return { user, profile: null, error: 'Profile not found' }
      }

      return { user, profile, error: null }
    }
    
    const accessToken = authHeader.replace('Bearer ', '')

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return { user: null, profile: null, error: 'Invalid or expired token' }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return { user, profile: null, error: 'Profile not found' }
    }

    return { user, profile, error: null }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return { user: null, profile: null, error: 'Internal server error' }
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

export function hasStaffPermissions(userRole: string): boolean {
  return userRole === 'staff' || userRole === 'admin'
}

export function hasAdminPermissions(userRole: string): boolean {
  return userRole === 'admin'
}