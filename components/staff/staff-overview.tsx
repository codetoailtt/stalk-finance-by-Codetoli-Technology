'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Clock, CheckCircle, Users, Eye } from 'lucide-react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api-client'
import useSWR from 'swr'

export function StaffOverview() {
  const { data: queries, isLoading } = useSWR(
    'staff-queries', 
    () => ApiClient.getQueries(1),
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 10000
    }
  )

  // Handle both old format (array) and new format (object with data and pagination)
  const queriesData = queries?.data || (Array.isArray(queries) ? queries : [])

  const stats = [
    {
      title: 'Total Enquiries',
      value: Array.isArray(queriesData) ? queriesData.length : 0,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
      loading: isLoading
    },
    {
      title: 'Pending Review',
      value: Array.isArray(queriesData) ? queriesData.filter((q: any) => q.status === 'pending').length : 0,
      icon: Clock,
      color: 'text-orange-600 bg-orange-100',
      loading: isLoading
    },
    {
      title: 'Under Review',
      value: Array.isArray(queriesData) ? queriesData.filter((q: any) => q.status === 'under_review').length : 0,
      icon: CheckCircle,
      color: 'text-purple-600 bg-purple-100',
      loading: isLoading
    },
    {
      title: 'Approved Today',
      value: Array.isArray(queriesData) ? queriesData.filter((q: any) => {
        const today = new Date().toDateString()
        return q.status === 'approved' && q.approved_at && new Date(q.approved_at).toDateString() === today
      }).length : 0,
      icon: Users,
      color: 'text-green-600 bg-green-100',
      loading: isLoading
    }
  ]

  const recentQueries = Array.isArray(queriesData) ? queriesData.slice(0, 8) : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Review and process user enquiries
          </p>
        </div>
        
        <Button asChild>
          <Link href="/staff/queries">
            <FileText size={16} className="mr-2" />
            View All Enquiries
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.loading ? '...' : stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Enquiries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Enquiries</CardTitle>
          <Button variant="outline" asChild>
            <Link href="/staff/queries">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : recentQueries.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No enquiries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentQueries.map((query: any) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {query.reference_id}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {query.service?.name || query.other_service} • {query.user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(query.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      query.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : query.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : query.status === 'under_review'
                        ? 'bg-purple-100 text-purple-800'
                        : query.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {query.status.replace('_', ' ')}
                    </span>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/staff/queries/${query.id}`} prefetch={true}>
                        <Eye size={14} className="mr-1" />
                        Review
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}