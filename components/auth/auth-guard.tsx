'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type UserRole } from '@/lib/types'
import { hasRole, clearUserCache, getCurrentUser } from '@/lib/auth-secure'
import { ComponentLoading } from '@/components/ui/loading'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requiredRole = 'user', 
  redirectTo = '/signin' 
}: AuthGuardProps) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getCurrentUser()

        if (!profile) {
          router.push(redirectTo)
          return
        }

        // Check if user is blocked
        if (profile.blocked) {
          router.push('/blocked')
          return
        }

        if (!hasRole(profile.role, requiredRole)) {
          router.push('/dashboard') // Redirect to appropriate dashboard
          return
        }

        setUser({ id: profile.id })
        setProfile(profile)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, redirectTo, router])

  if (loading) {
    return <ComponentLoading />
  }

  if (!user || !profile) {
    return null
  }

  // Additional check for blocked users
  if (profile.blocked) {
    router.push('/blocked')
    return null
  }

  return <>{children}</>
}