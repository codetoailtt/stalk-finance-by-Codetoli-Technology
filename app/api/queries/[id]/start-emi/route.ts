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
    const { emi_date, emi_percent, tenure_months } = body

    // Validation
    if (!emi_date || !emi_percent || !tenure_months) {
      return NextResponse.json(
        { error: 'EMI date, percentage, and tenure are required' },
        { status: 400 }
      )
    }

    if (emi_date < 1 || emi_date > 31) {
      return NextResponse.json(
        { error: 'EMI date must be between 1 and 31' },
        { status: 400 }
      )
    }

    if (emi_percent < 0 || emi_percent > 100) {
      return NextResponse.json(
        { error: 'EMI percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    if (tenure_months < 1 || tenure_months > 60) {
      return NextResponse.json(
        { error: 'Tenure must be between 1 and 60 months' },
        { status: 400 }
      )
    }

    // Check if query exists and service fee is paid
    const { data: query, error: queryError } = await supabaseAdmin
      .from('queries')
      .select('service_fee_paid, principal_amount, amount')
      .eq('id', params.id)
      .single()

    if (queryError || !query) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      )
    }

    if (!query.service_fee_paid) {
      return NextResponse.json(
        { error: 'Service fee must be paid before starting EMI' },
        { status: 400 }
      )
    }

    // Create next month's EMI start date
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, emi_date)

    const updates: any = {
      emi_started: false,
      emi_started_at: nextMonth.toISOString(),
      emi_date,
      emi_percent,
      tenure_months,
      principal_amount: query.principal_amount || query.amount
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
        { error: 'Failed to start EMI' },
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