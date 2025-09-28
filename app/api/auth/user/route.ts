import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/middleware-auth'

export async function GET(request: NextRequest) {
  try {
    const { user, profile, error } = await getAuthenticatedUser(request)
    if (error || !user || !profile) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only send necessary fields to client
    const safeUser = {
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
      role: profile.role,
  
      
      blocked: profile.blocked,

      // Add more if needed, but avoid sending metadata, confirmed_at, etc.
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}