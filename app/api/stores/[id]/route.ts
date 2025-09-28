import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

import { validateUUID, sanitizeString } from '@/lib/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate UUID format to prevent SQL injection
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: 'Invalid store ID format' },
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

    if (!hasRole(profile.role, 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const supabaseAdmin = createServerSupabaseClient()
    const body = await request.json()

    // Sanitize all string inputs
    if (body.name) body.name = sanitizeString(body.name)
    if (body.owner_name) body.owner_name = sanitizeString(body.owner_name)
    if (body.owner_email) body.owner_email = sanitizeString(body.owner_email)
    if (body.owner_phone) body.owner_phone = sanitizeString(body.owner_phone)
    if (body.address) body.address = sanitizeString(body.address)
    if (body.owner_pancard) body.owner_pancard = sanitizeString(body.owner_pancard)
    if (body.partner_name) body.partner_name = sanitizeString(body.partner_name)
    if (body.partner_name_2) body.partner_name_2 = sanitizeString(body.partner_name_2)
    if (body.gstin_no) body.gstin_no = sanitizeString(body.gstin_no)

    // Only validate required fields if they are present in the update
    if (
      ('name' in body && !body.name) ||
      ('owner_name' in body && !body.owner_name) ||
      ('owner_email' in body && !body.owner_email)
    ) {
      return NextResponse.json(
        { error: 'Store name, owner name, and owner email are required' },
        { status: 400 }
      )
    }

    // Validate GSTIN format if provided
    if (body.gstin_no && body.gstin_no.length > 0 && body.gstin_no.length !== 15) {
      return NextResponse.json(
        { error: 'GSTIN number must be exactly 15 characters' },
        { status: 400 }
      )
    }

    // Always update updated_at
    const updateData = { ...body, updated_at: new Date().toISOString() }

    // Update store (partial update)
    const { data: updatedStore, error: dbError } = await supabaseAdmin
      .from('stores')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (dbError) {
      console.error('Store update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update store' },
        { status: 500 }
      )
    }

    // After updating or deleting, when returning the store object:
    // Filter fields for regular users
    const safeStore = {
      id: updatedStore.id,
      name: updatedStore.name,
      owner_name: updatedStore.owner_name,
      owner_email: updatedStore.owner_email,
      owner_phone: updatedStore.owner_phone,
      address: updatedStore.address,
      active: updatedStore.active,
      verified: updatedStore.verified,
      created_at: updatedStore.created_at
    }
    return NextResponse.json(safeStore)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate UUID format to prevent SQL injection
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: 'Invalid store ID format' },
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

    if (!hasRole(profile.role, 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const supabaseAdmin = createServerSupabaseClient()

    // Check if store is being used in any queries
    const { data: queries, error: queryError } = await supabaseAdmin
      .from('queries')
      .select('id, reference_id, status, user:profiles!queries_user_id_fkey(email)')
      .eq('store_id', params.id)

    if (queryError) {
      console.error('Query check error:', queryError)
      return NextResponse.json(
        { error: 'Failed to check store usage' },
        { status: 500 }
      )
    }

    if (queries && queries.length > 0) {
      const activeQueries = queries.filter((q: any) => 
        !['completed', 'rejected'].includes(q.status)
      )
      
      if (activeQueries.length > 0) {
        const queryList = activeQueries.slice(0, 3).map((q: any) => 
          `${q.reference_id} (${q.status})`
        ).join(', ')
        
        const moreCount = activeQueries.length > 3 ? ` and ${activeQueries.length - 3} more` : ''
        
        return NextResponse.json(
          { 
            error: `Cannot delete store that is being used in ${activeQueries.length} active queries: ${queryList}${moreCount}. Please complete or reject these queries first, or deactivate the store instead.`,
            activeQueries: activeQueries.length,
            canForceDelete: false
          },
          { status: 400 }
        )
      }
      
      // If only completed/rejected queries, allow deletion but warn
      return NextResponse.json(
        { 
          error: `Store has ${queries.length} completed/rejected queries. Deletion will remove store reference from these queries. Consider deactivating instead.`,
          canForceDelete: true,
          completedQueries: queries.length
        },
        { status: 400 }
      )
    }

    // Start transaction to delete store and update related queries
    const { error: deleteError } = await supabaseAdmin
      .from('stores')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete store: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // Update any queries that referenced this store to set store_id to null
    await supabaseAdmin
      .from('queries')
      .update({ store_id: null })
      .eq('store_id', params.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Store deleted successfully',
      updatedQueries: queries?.length || 0
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}