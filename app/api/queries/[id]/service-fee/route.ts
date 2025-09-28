import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, profile, error } = await getAuthenticatedUser(request)
    
    if (error || !user || !profile) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!hasRole(profile.role, 'staff')) {
      return NextResponse.json(
        { error: 'Forbidden - Staff access required' },
        { status: 403 }
      )
    }

    const supabaseAdmin = createServerSupabaseClient()
    const body = await request.json()
    const { paid } = body

    const updates: any = {
      service_fee_paid: paid,
      service_fee_paid_at: paid ? new Date().toISOString() : null
    }

    const { data: updatedQuery, error: dbError } = await supabaseAdmin
      .from('queries')
      .update(updates)
      .eq('id', params.id)
      .select(`
        *,
        service:services(*),
        store:stores(*),
        user:profiles!queries_user_id_fkey(id, email, full_name)
      `)
      .single()

    if (dbError) {
      console.error('Update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update service fee status' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedQuery)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// No changes needed, staff-only endpoint