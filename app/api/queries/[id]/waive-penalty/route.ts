import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(
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

    // Waive penalty using the database function
    const { data, error: dbError } = await supabaseAdmin
      .rpc('waive_penalty', {
        query_id: params.id,
        waived_by: user.id
      })

    if (dbError) {
      console.error('Waive penalty error:', dbError)
      return NextResponse.json(
        { error: 'Failed to waive penalty' },
        { status: 500 }
      )
    }

    // Get updated query
    const { data: updatedQuery, error: fetchError } = await supabaseAdmin
      .from('queries')
      .select(`
        *,
        service:services(*),
        store:stores(*),
        user:profiles!queries_user_id_fkey(id, email, full_name)
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated query' },
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