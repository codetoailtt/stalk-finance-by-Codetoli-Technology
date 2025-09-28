import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get token from cookie
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (accessToken) {
      // Sign out from Supabase
      await supabase.auth.signOut()
    }

    // Clear cookies
    const response = NextResponse.json({ success: true })
    
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}