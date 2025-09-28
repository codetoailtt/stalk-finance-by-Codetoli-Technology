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
        { error: 'Invalid service ID format' },
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

    // Update service
    const { data: updatedService, error: dbError } = await supabaseAdmin
      .from('services')
      .update({
        name: sanitizedName,
        description: sanitizedDescription,
        base_fee: base_fee || 0,
        active: active ?? true
      })
      .eq('id', params.id)
      .select()
      .single()

    if (dbError) {
      console.error('Service update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update service' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedService)
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
        { error: 'Invalid service ID format' },
        { status: 400 }
      )
    }

    // Validate UUID format to prevent SQL injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json(
        { error: 'Invalid service ID format' },
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

    // Check if service is being used in any queries
    const { data: queries, error: queryError } = await supabaseAdmin
      .from('queries')
      .select('id, reference_id, status, user:profiles!queries_user_id_fkey(email)')
      .eq('service_id', params.id)

    if (queryError) {
      console.error('Query check error:', queryError)
      return NextResponse.json(
        { error: 'Failed to check service usage' },
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
            error: `Cannot delete service that is being used in ${activeQueries.length} active queries: ${queryList}${moreCount}. Please complete or reject these queries first, or deactivate the service instead.`,
            activeQueries: activeQueries.length,
            canForceDelete: false
          },
          { status: 400 }
        )
      }
      
      // If only completed/rejected queries, allow deletion but warn
      return NextResponse.json(
        { 
          error: `Service has ${queries.length} completed/rejected queries. Deletion will remove service reference from these queries. Consider deactivating instead.`,
          canForceDelete: true,
          completedQueries: queries.length
        },
        { status: 400 }
      )
    }

    // Delete service
    const { error: deleteError } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete service: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // Update any queries that referenced this service to set service_id to null
    await supabaseAdmin
      .from('queries')
      .update({ service_id: null })
      .eq('service_id', params.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Service deleted successfully',
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