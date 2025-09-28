import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAuthenticatedUser } from '@/lib/middleware-auth'
import { sanitizeString } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    // Fetch active stores only
    const { data: stores, error: dbError } = await supabase
      .from('stores')
      .select('*')
      .eq('active', true)
      .eq('verified', true)
      .order('name', { ascending: true })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      )
    }

    // Try to get user and profile from request (if available)
    let isAdminOrStaff = false
    try {
      const { user, profile } = await getAuthenticatedUser(request)
      if (profile && (profile.role === 'admin' || profile.role === 'staff')) {
        isAdminOrStaff = true
      }
    } catch (e) {
      // Ignore errors, treat as public user
    }

    let filteredStores
    if (isAdminOrStaff) {
      filteredStores = stores.map(store => ({
        id: store.id,
        name: store.name,
        owner_name: store.owner_name,
        owner_email: store.owner_email,
        owner_phone: store.owner_phone,
        address: store.address,
        active: store.active,
        verified: store.verified,
        created_at: store.created_at,
        approved_by: store.approved_by,
        approved_at: store.approved_at,
        owner_pancard: store.owner_pancard,
        partner_name: store.partner_name,
        partner_name_2: store.partner_name_2,
        updated_at: store.updated_at,
        gstin_no: store.gstin_no
      }))
    } else {
      filteredStores = stores.map(store => ({
        id: store.id,
        name: store.name,
        owner_name: store.owner_name,
        owner_email: store.owner_email,
        owner_phone: store.owner_phone,
        address: store.address,
        active: store.active,
        verified: store.verified,
        created_at: store.created_at
      }))
    }

    return NextResponse.json(filteredStores, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
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
    // Get authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authorization.replace('Bearer ', '')
    const supabaseAdmin = createServerSupabaseClient()
    
    // Verify the JWT token and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      owner_name, 
      owner_email, 
      owner_phone, 
      address,
      owner_pancard,
      partner_name,
      partner_name_2,
      gstin_no
    } = body

    // Sanitize all string inputs
    const sanitizedName = name ? sanitizeString(name) : null
    const sanitizedOwnerName = owner_name ? sanitizeString(owner_name) : null
    const sanitizedOwnerEmail = owner_email ? sanitizeString(owner_email) : null
    const sanitizedOwnerPhone = owner_phone ? sanitizeString(owner_phone) : null
    const sanitizedAddress = address ? sanitizeString(address) : null
    const sanitizedOwnerPancard = owner_pancard ? sanitizeString(owner_pancard) : null
    const sanitizedPartnerName = partner_name ? sanitizeString(partner_name) : null
    const sanitizedPartnerName2 = partner_name_2 ? sanitizeString(partner_name_2) : null
    const sanitizedGstinNo = gstin_no ? sanitizeString(gstin_no) : null

    // Validation
    if (!sanitizedName || !sanitizedOwnerName || !sanitizedOwnerEmail) {
      return NextResponse.json(
        { error: 'Store name, owner name, and owner email are required' },
        { status: 400 }
      )
    }

    // Create new store
    const { data: newStore, error: dbError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: sanitizedName,
        owner_name: sanitizedOwnerName,
        owner_email: sanitizedOwnerEmail,
        owner_phone: sanitizedOwnerPhone,
        address: sanitizedAddress,
        owner_pancard: sanitizedOwnerPancard,
        partner_name: sanitizedPartnerName,
        partner_name_2: sanitizedPartnerName2,
        gstin_no: sanitizedGstinNo,
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

    return NextResponse.json(newStore, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}