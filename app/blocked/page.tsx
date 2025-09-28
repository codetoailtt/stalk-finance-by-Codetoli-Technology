'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Home, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { signOut } from '@/lib/auth-secure'

export default function BlockedPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto sign out blocked users
    const handleSignOut = async () => {
      await signOut()
    }
    handleSignOut()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <CardTitle className="text-red-800">Account Blocked</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-700">
              Your account has been temporarily blocked by our administrators. 
              You cannot access the platform at this time.
            </p>
            
            <p className="text-sm text-red-600">
              If you believe this is an error or would like to appeal this decision, 
              please contact our support team.
              
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium">
                  You don't have access to this platform.
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Please contact support if you think this is a mistake.
                </p>
              </div>
            </p>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-red-300 text-red-700 hover:bg-red-100"
                asChild
              >
                <a href="mailto:stalkfinancepvtltd@gmail.com">
                  <Mail size={16} className="mr-2" />
                  Contact Support
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <Link href="/">
                  <Home size={16} className="mr-2" />
                  Go to Homepage
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-red-200">
              <p className="text-xs text-red-600">
                Your account has been blocked by our administrators. 
                Phone: +91 80107 79828
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}