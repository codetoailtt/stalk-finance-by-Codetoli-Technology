import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/middleware-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(
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

    // Get document details
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select(`
        *,
        query:queries!documents_query_id_fkey(user_id)
      `)
      .eq('id', params.id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canDownload = 
      profile.role === 'admin' ||
      profile.role === 'staff' ||
      document.uploaded_by === user.id ||
      document.query.user_id === user.id

    if (!canDownload) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get signed URL from Supabase Storage
    const { data: signedUrlData, error: urlError } = await supabaseAdmin
      .storage
      .from('documents')
      .createSignedUrl(document.storage_path, 300) // 5 minutes expiry

    if (urlError || !signedUrlData) {
      console.error('Signed URL error:', urlError)
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      )
    }

    // Fetch the file from Supabase Storage
    const fileResponse = await fetch(signedUrlData.signedUrl)
    
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: 500 }
      )
    }

    const fileBuffer = await fileResponse.arrayBuffer()

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mime_type,
        'Content-Disposition': `attachment; filename="${document.original_filename}"`,
        'Content-Length': document.file_size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}