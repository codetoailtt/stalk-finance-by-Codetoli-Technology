'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Clock, CheckCircle, AlertCircle, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api-client'
import useSWR from 'swr'

export function DashboardOverview() {
  const { data: queries, isLoading } = useSWR(
    'dashboard-queries', 
    () => ApiClient.getQueries(1),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000
    }
  )

  // Handle both old format (array) and new format (object with data and pagination)
  const queriesData = queries?.data || (Array.isArray(queries) ? queries : [])
  
  const stats = Array.isArray(queriesData) ? [
    {
      title: 'Total Enquiries',
      value: queriesData.length,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Pending',
      value: queriesData.filter((q: any) => q.status === 'pending').length,
      icon: Clock,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'Approved',
      value: queriesData.filter((q: any) => q.status === 'approved').length,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Under Review',
      value: queriesData.filter((q: any) => q.status === 'under_review').length,
      icon: AlertCircle,
      color: 'text-purple-600 bg-purple-100'
    }
  ] : []

  const recentQueries = Array.isArray(queriesData) ? queriesData.slice(0, 5) : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your finance enquiries and activities
          </p>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/queries/new">
            <Plus size={16} className="mr-2" />
            New Enquiry
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      {isLoading ? '...' : stat.value}
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
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <CardTitle>Recent Enquiries</CardTitle>
          <Button variant="outline" asChild>
            <Link href="/dashboard/queries">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
              <p className="text-muted-foreground mb-4">No enquiries yet</p>
              <Button asChild>
                <Link href="/dashboard/queries/new">Create Your First Enquiry</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentQueries.map((query: any) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors w-full"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {query.reference_id}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {query.service?.name || query.other_service} • {new Date(query.created_at).toLocaleDateString()}
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
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {query.status.replace('_', ' ')}
                    </span>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/queries/${query.id}`} prefetch={true}>
                        <Eye size={14} className="mr-1" />
                        View
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