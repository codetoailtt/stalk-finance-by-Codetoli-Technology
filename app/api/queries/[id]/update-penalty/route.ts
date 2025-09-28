import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/middleware-auth'
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

    const supabaseAdmin = createServerSupabaseClient()

    // Get query to check ownership
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

    // Allow staff/admin or query owner
    const isStaffOrAdmin = profile.role === 'staff' || profile.role === 'admin'
    const isOwner = query.user_id === user.id
    if (!isStaffOrAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Update penalty using the database function
    const { data, error: dbError } = await supabaseAdmin
      .rpc('update_penalty_for_query', {
        query_id: params.id
      })

    if (dbError) {
      console.error('Update penalty error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update penalty' },
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

    // Filter sensitive fields for user
    let safeQuery = updatedQuery
    if (profile.role === 'user') {
      const {
        id, reference_id, user_id, service_id, store_id, other_store, amount, timeline, purpose, description,
        status, service_fee_paid, service_fee_paid_at, emi_started, emi_started_at, emi_date, emi_percent,
        emi_payments, principal_amount, penalty_amount, penalty_started_at, penalty_waived,
        tenure_months, other_service, terms_accepted, terms_accepted_at, created_at, updated_at, approved_at,
        completed_at, service, store, user, documents, notes
      } = updatedQuery

      safeQuery = {
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
    }

    return NextResponse.json({
      penalty_amount: data,
      query: safeQuery
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}