'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ComponentLoading } from '@/components/ui/loading'
import { 
  Home, 
  FileText, 
  Store, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Bell
} from 'lucide-react'
import { signOut, getCurrentUser, clearUserCache } from '@/lib/auth-secure'
import { useEffect, useState as useStateHook } from 'react'
import { type Profile } from '@/lib/types'
import { NotificationSystem } from '@/components/ui/notification-system'
import { ApiClient } from '@/lib/api-client'
import useSWR from 'swr'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useStateHook<Profile | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch queries for notifications
  const { data: queries } = useSWR(
    profile?.role === 'user' ? 'user-queries-notifications' : null,
    () => ApiClient.getQueries(1),
    {
      refreshInterval: 60000,
      revalidateOnFocus: true
    }
  )

  const queriesData = queries?.data || (Array.isArray(queries) ? queries : [])
  useEffect(() => {
    getCurrentUser().then(setProfile)
  }, [])

  const handleSignOut = async () => {
    clearUserCache()
    await signOut()
    router.push('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['user', 'staff', 'admin'] },
    { name: 'My Enquiries', href: '/dashboard/queries', icon: FileText, roles: ['user'] },
    { name: 'All Enquiries', href: '/staff/queries', icon: FileText, roles: ['staff', 'admin'] },
    { name: 'Users', href: '/staff/users', icon: Users, roles: ['staff'] },
    { name: 'Stores', href: '/admin/stores', icon: Store, roles: ['admin'] },
    { name: 'Products', href: '/admin/services', icon: FileText, roles: ['admin'] },
    { name: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
    { name: 'Staff Portal', href: '/staff', icon: Shield, roles: ['staff'] },
    { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['admin'] },
  ]

  const filteredNavigation = navigation.filter(item => 
    profile && item.roles.includes(profile.role)
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 max-w-full bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/assets/logo.png" 
              alt="Stalk Finance logo" 
              className="w-32 h-32 object-contain"
            />
          </Link>
          
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                } w-full text-left`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} className="flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-2 sm:p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                {profile?.full_name?.split(' ').map(n => n[0]).join('') || profile?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.role?.toUpperCase()}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs sm:text-sm"
          >
            <LogOut size={14} className="mr-2 flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 w-full">
        {/* Top Bar */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 w-full">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          {/* Shift welcome and notification to right end */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
              </span>
              {profile?.role === 'user' && (
                <NotificationSystem queries={queriesData} />
              )}
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-auto w-full">
          <div className="p-4 sm:p-6 max-w-full">
            <Suspense fallback={<ComponentLoading />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}