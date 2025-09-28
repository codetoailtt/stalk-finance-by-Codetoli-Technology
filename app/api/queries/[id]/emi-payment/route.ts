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
    const body = await request.json()
    const { month, amount } = body

    // Get current query
    const { data: query, error: queryError } = await supabaseAdmin
      .from('queries')
      .select('emi_payments, emi_date, penalty_amount')
      .eq('id', params.id)
      .single()

    if (queryError || !query) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      )
    }

    // Update EMI payments JSON
    const currentPayments = query.emi_payments || {}
    const paymentKey = `${month}-${String(query.emi_date).padStart(2, '0')}`
    
    const penaltyIncluded = query.penalty_amount > 0
    
    currentPayments[paymentKey] = {
      amount: amount,
      paid_at: new Date().toISOString(),
      marked_by: user.id,
      penalty_included: penaltyIncluded,
      penalty_amount: penaltyIncluded ? query.penalty_amount : 0
    }

    // Reset penalty when EMI is paid
    const updates: any = { 
      emi_payments: currentPayments,
      penalty_amount: 0,
      penalty_started_at: null,
      penalty_waived: false,
      penalty_waived_by: null
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
        { error: 'Failed to mark EMI as paid' },
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