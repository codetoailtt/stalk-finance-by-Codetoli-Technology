import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// WARNING: This function uses SUPABASE_SERVICE_ROLE_KEY
// NEVER import this into client-side code

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { user, profile, error } = await getAuthenticatedUser(request)
    
    if (error || !user || !profile) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createServerSupabaseClient()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const queryId = formData.get('query_id') as string

    if (!file || !queryId) {
      return NextResponse.json(
        { error: 'File and query ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Verify user owns this query
    const { data: query, error: queryError } = await supabaseAdmin
      .from('queries')
      .select('user_id, status')
      .eq('id', queryId)
      .single()

    if (queryError || !query) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      )
    }

    if (query.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (query.status !== 'approved') {
      return NextResponse.json(
        { error: 'Can only upload documents to approved queries' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use original file without compression since Sharp is causing issues
    const originalFilename = file.name
    const filename = `${Date.now()}-${originalFilename}`

    // Upload to Supabase Storage without compression
    const storagePath = `documents/${user.id}/${queryId}/${filename}`
    
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Save document record to database
    const { data: document, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert({
        query_id: queryId,
        uploaded_by: user.id,
        filename,
        original_filename: originalFilename,
        storage_path: storagePath,
        mime_type: file.type,
        file_size: buffer.length,
        compressed: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Document record error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save document record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document,
      compressed: false
    }, { status: 201 })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}