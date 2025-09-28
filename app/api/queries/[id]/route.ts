import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

import { validateUUID, sanitizeString } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate UUID format to prevent SQL injection
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: 'Invalid query ID format' },
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

    const supabase = createServerSupabaseClient()

    // Get query with all related data
    const { data: query, error: queryError } = await supabase
      .from('queries')
      .select(`
        *,
        service:services(*),
        store:stores(*),
        user:profiles!queries_user_id_fkey(id, email, full_name),
        documents(*),
        notes(*, created_by_profile:profiles!notes_created_by_fkey(id, email, full_name))
      `)
      .eq('id', params.id)
      .single()

    if (queryError || !query) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      )
    }

    // --- EMI started logic ---
    if (query.emi_started_at) {
      const now = new Date()
      const emiStart = new Date(query.emi_started_at)
      const shouldBeStarted = (
        now.getFullYear() > emiStart.getFullYear() ||
        (now.getFullYear() === emiStart.getFullYear() && now.getMonth() > emiStart.getMonth()) ||
        (now.getFullYear() === emiStart.getFullYear() && now.getMonth() === emiStart.getMonth() && now.getDate() >= emiStart.getDate())
      )
      if (query.emi_started !== shouldBeStarted) {
        // Update in DB for consistency
        await supabase
          .from('queries')
          .update({ emi_started: shouldBeStarted })
          .eq('id', params.id)
        query.emi_started = shouldBeStarted
      }
    }
    // --- end EMI started logic ---

    // Check permissions
    const canView = 
      hasRole(profile.role, 'admin') ||
      hasRole(profile.role, 'staff') ||
      query.user_id === user.id

    if (!canView) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Filter notes based on role
    if (profile.role === 'user') {
      // Remove sensitive fields for users
      const {
        id, reference_id, user_id, service_id, store_id, other_store, amount, timeline, purpose, description,
        status, service_fee_paid, service_fee_paid_at, emi_started, emi_started_at, emi_date, emi_percent,
        emi_payments, principal_amount, penalty_amount, penalty_started_at, penalty_waived,
        tenure_months, other_service, terms_accepted, terms_accepted_at, created_at, updated_at, approved_at,
        completed_at, service, store, user, documents, notes
      } = query

      // Only include other_service if it is a non-empty string
      const safeQuery: any = {
        id, reference_id, user_id, service_id, store_id, other_store, amount, timeline, purpose, description,
        status, service_fee_paid, service_fee_paid_at, emi_started, emi_started_at, emi_date, emi_percent,
        emi_payments, principal_amount, penalty_amount, penalty_started_at, penalty_waived,
        tenure_months, terms_accepted, terms_accepted_at, created_at, updated_at, approved_at,
        completed_at,
        service: service ? {
          id: service.id,
          name: service.name,
          active: service.active,
          base_fee: service.base_fee,
          created_at: service.created_at,
          description: service.description
        } : null,
        store: store ? {
          id: store.id,
          name: store.name,
          active: store.active,
          address: store.address,
          verified: store.verified,
          created_at: store.created_at,
          owner_name: store.owner_name,
          owner_email: store.owner_email,
          owner_phone: store.owner_phone
          // Do NOT include owner_pancard, partner_name, partner_name_2, gstin_no, updated_at, approved_by, approved_at
        } : null,
        user: user ? {
          id: user.id,
          email: user.email,
          full_name: user.full_name
        } : null,
        documents: documents || [],
        notes: notes || []
      }
      if (typeof other_service === 'string' && other_service.trim().length > 0) {
        safeQuery.other_service = other_service
      }
      return NextResponse.json(safeQuery)
    }

    return NextResponse.json(query)
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
        { error: 'Invalid query ID format' },
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

    const supabaseAdmin = createServerSupabaseClient()

    // Check permissions - only admin or query owner can delete
    const { data: query, error: queryError } = await supabaseAdmin
      .from('queries')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (queryError || !query) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      )
    }

    const canDelete = 
      hasRole(profile.role, 'admin') ||
      query.user_id === user.id

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete query (documents and notes will be cascade deleted)
    const { error: deleteError } = await supabaseAdmin
      .from('queries')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete query' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Query deleted successfully' })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate UUID format to prevent SQL injection
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: 'Invalid query ID format' },
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
    const body = await request.json()
    const { status, note } = body

    // Sanitize note input
    const sanitizedNote = note ? sanitizeString(note) : null

    const updates: any = {}

    if (status) {
      updates.status = status
      if (status === 'approved') {
        updates.admin_approved_by = user.id
        updates.approved_at = new Date().toISOString()
      } else if (status === 'under_review') {
        updates.staff_assigned = user.id
      }
    }

    // Update query
    const { data: updatedQuery, error: dbError } = await supabaseAdmin
      .from('queries')
      .update(updates)
      .eq('id', params.id)
      .select(`
        *,
        service:services(*),
        store:stores(*),
        user:profiles!queries_user_id_fkey(id, email, full_name),
        documents(*),
        notes(*, created_by_profile:profiles!notes_created_by_fkey(id, email, full_name))
      `)
      .single()

    if (dbError) {
      console.error('Update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update query' },
        { status: 500 }
      )
    }

    // Add note if provided
    if (sanitizedNote) {
      await supabaseAdmin
        .from('notes')
        .insert({
          query_id: params.id,
          created_by: user.id,
          content: sanitizedNote,
          internal: false
        })
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