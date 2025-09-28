import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAuthenticatedUser, hasRole } from '@/lib/middleware-auth'

import { sanitizeString } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Fetch active services only
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      )
    }

    // Set cache headers for performance
    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600', // 5 minutes cache
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
    
    const { name, description, base_fee, active } = body

    // Sanitize string inputs
    const sanitizedName = name ? sanitizeString(name) : null
    const sanitizedDescription = description ? sanitizeString(description) : null

    // Validation
    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      )
    }

    // Create new service
    const { data: newService, error: dbError } = await supabaseAdmin
      .from('services')
      .insert({
        name: sanitizedName,
        description: sanitizedDescription,
        base_fee: base_fee || 0,
        active: active ?? true
      })
      .select()
      .single()

    if (dbError) {
      console.error('Service creation error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create service' },
        { status: 500 }
      )
    }

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}