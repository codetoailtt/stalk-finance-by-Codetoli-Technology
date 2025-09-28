import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

import { validateUUID } from '@/lib/validation'

export async function PATCH(
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

    // Prevent admin from blocking themselves
    if (params.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot block your own account' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServerSupabaseClient()
    const body = await request.json()
    const { blocked } = body

    const updates: any = {
      blocked,
      blocked_at: blocked ? new Date().toISOString() : null,
      blocked_by: blocked ? user.id : null,
      updated_at: new Date().toISOString()
    }

    const { data: updatedUser, error: dbError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (dbError) {
      console.error('Block user error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update user block status' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}