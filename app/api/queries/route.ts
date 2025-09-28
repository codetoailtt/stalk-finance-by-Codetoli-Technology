import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { createQuerySchema } from '@/lib/validation'

import { sanitizeString, validateUUID } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '1000')
    const offset = (page - 1) * limit

    const { user, profile, error } = await getAuthenticatedUser(request)
    
    if (error || !user || !profile) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createServerSupabaseClient()

    let query = supabaseAdmin
      .from('queries')
      .select(`
        *,
        service:services(*),
        store:stores(*),
        user:profiles!queries_user_id_fkey(id, email, full_name)
      `)

    // Filter based on user role
    if (profile.role === 'user') {
      query = query.eq('user_id', user.id)
    }
    // Staff and admin can see all queries

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: queries, error: dbError } = await query

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch queries' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('queries')
      .select('*', { count: 'exact', head: true })

    if (profile.role === 'user') {
      countQuery = countQuery.eq('user_id', user.id)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json(queries) // Return without pagination info if count fails
    }

    // After fetching queries and count
    // Filter fields for users
    let safeQueries = queries
    if (profile.role === 'user') {
      safeQueries = queries.map((q: any) => {
        const {
          id, reference_id, user_id, service_id, store_id, other_store, amount, timeline, purpose, description,
          status, service_fee_paid, service_fee_paid_at, emi_started, emi_started_at, emi_date, emi_percent,
          emi_payments, principal_amount, penalty_amount, penalty_started_at, penalty_waived,
          tenure_months, other_service, terms_accepted, terms_accepted_at, created_at, updated_at, approved_at,
          completed_at, service, store, user
        } = q
        return {
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
        }
      })
    }
    return NextResponse.json({
      data: safeQueries,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = rateLimit(`create-query-${clientIP}`, 10, 60 * 1000) // 10 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          }
        }
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

    const body = await request.json()
    
    // Validate input
    const validationResult = createQuerySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const {
      service_id,
      other_service,
      store_id,
      other_store,
      amount,
      tenure_months,
      timeline,
      purpose,
      description,
      terms_accepted,
      terms_accepted_at
    } = validationResult.data

    // Validate UUIDs if provided
    if (service_id && !validateUUID(service_id)) {
      return NextResponse.json(
        { error: 'Invalid service ID format' },
        { status: 400 }
      )
    }

    if (store_id && store_id !== 'other' && !validateUUID(store_id)) {
      return NextResponse.json(
        { error: 'Invalid store ID format' },
        { status: 400 }
      )
    }

    // Sanitize string inputs
    const sanitizedOtherService = other_service ? sanitizeString(other_service) : null
    const sanitizedTimeline = timeline ? sanitizeString(timeline) : null
    const sanitizedPurpose = purpose ? sanitizeString(purpose) : null
    const sanitizedDescription = description ? sanitizeString(description) : null

    // Validation
    if (!service_id && !sanitizedOtherService) {
      return NextResponse.json(
        { error: 'Service or custom service description is required' },
        { status: 400 }
      )
    }

    // Validate terms acceptance
    if (!terms_accepted) {
      return NextResponse.json(
        { error: 'Terms and conditions must be accepted' },
        { status: 400 }
      )
    }
    // If store_id is "other" and other_store data is provided
    let finalStoreId: string | undefined = store_id
    let otherStoreData = null

    if (store_id === 'other' && other_store) {
      // Validate other_store data
      if (!other_store.name || !other_store.owner_email || !other_store.owner_phone || !other_store.address) {
        return NextResponse.json(
          { error: 'Other store name, owner email, phone, and address are required' },
          { status: 400 }
        )
      }
      
      // Sanitize other_store data
      otherStoreData = {
        name: sanitizeString(other_store.name),
        owner_email: sanitizeString(other_store.owner_email),
        owner_phone: sanitizeString(other_store.owner_phone),
        address: sanitizeString(other_store.address)
      }
      
      finalStoreId = undefined
    }


    // Create query
    const { data: query, error: dbError } = await supabaseAdmin
      .from('queries')
      .insert({
        user_id: user.id,
        service_id: service_id || null,
        other_service: sanitizedOtherService,
        store_id: finalStoreId,
        other_store: otherStoreData,
        amount: amount !== undefined && amount !== null ? Number(amount) : null,
        tenure_months: tenure_months || 12,
        timeline: sanitizedTimeline,
        purpose: sanitizedPurpose,
        description: sanitizedDescription,
        status: 'pending',
        terms_accepted: true,
        terms_accepted_at: terms_accepted_at || new Date().toISOString()
      })
      .select(`
        *,
        service:services(*),
        store:stores(*)
      `)
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create query' },
        { status: 500 }
      )
    }

    return NextResponse.json(query, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}