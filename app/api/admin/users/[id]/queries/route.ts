import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

import { validateUUID } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate UUID format to prevent SQL injection
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const { user, profile, error } = await getAuthenticatedUser(request)
    
    if (error || !user || !profile) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!hasRole(profile.role, 'staff')) {
      return NextResponse.json( 
        { error: 'Forbidden - Staff or Admin access required' },
        { status: 403 }
      )
    }

    const supabaseAdmin = createServerSupabaseClient()

    // Get all queries for the specific user
    const { data: queries, error: dbError } = await supabaseAdmin
      .from('queries')
      .select(`
        *,
        service:services(*),
        store:stores(*)
      `)
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch user queries' },
        { status: 500 }
      )
    }

    return NextResponse.json(queries)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}