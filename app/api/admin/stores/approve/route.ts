import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { user, profile, error } = await getAuthenticatedUser(request)
    
    if (error || !user || !profile) {
      console.error('Auth error in store approval:', error)
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!hasRole(profile.role, 'admin')) {
      console.error('Role check failed:', profile.role)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const supabaseAdmin = createServerSupabaseClient()
    const body = await request.json()
    const { query_id, action } = body

    if (!query_id || !action) {
      return NextResponse.json(
        { error: 'Query ID and action are required' },
        { status: 400 }
      )
    }

    // Get the query with other_store data
    const { data: query, error: dbError } = await supabaseAdmin
      .from('queries')
      .select('*')
      .eq('id', query_id)
      .single()

    if (dbError || !query || !query.other_store) {
      return NextResponse.json(
        { error: 'Query not found or no other store data' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Create new store
      const { data: newStore, error: dbError } = await supabaseAdmin
        .from('stores')
        .insert({
          name: query.other_store.name,
          owner_name: query.other_store.name, // You might want to add owner_name to other_store
          owner_email: query.other_store.owner_email,
          owner_phone: query.other_store.owner_phone,
          active: true,
          verified: true,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) {
        console.error('Store creation error:', dbError)
        return NextResponse.json(
          { error: 'Failed to create store' },
          { status: 500 }
        )
      }

      // Update query to link to new store and clear other_store
      const { error: updateError } = await supabaseAdmin
        .from('queries')
        .update({
          store_id: newStore.id,
          other_store: null,
          status: 'pending'
        })
        .eq('id', query_id)

      if (updateError) {
        console.error('Query update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update query' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Store approved and created',
        store: newStore 
      })

    } else if (action === 'reject') {
      // Add note about rejection
      await supabaseAdmin
        .from('notes')
        .insert({
          query_id: query_id,
          created_by: user.id,
          content: 'Store request rejected by admin. Please use an existing store or contact support.',
          internal: false
        })

      // Clear other_store data
      const { error: updateError } = await supabaseAdmin
        .from('queries')
        .update({
          other_store: null,
          status: 'rejected'
        })
        .eq('id', query_id)

      if (updateError) {
        console.error('Query update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update query' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Store request rejected' 
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}