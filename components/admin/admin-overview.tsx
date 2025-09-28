'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Store, FileText, AlertCircle, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api-client'
import useSWR from 'swr'

export function AdminOverview() {
  const { data: queries, isLoading: queriesLoading } = useSWR(
    'admin-queries', 
    () => ApiClient.getQueries(1),
    { refreshInterval: 60000, dedupingInterval: 10000 }
  )
  const { data: stores, isLoading: storesLoading } = useSWR(
    'stores', 
    () => ApiClient.getStores(),
    { refreshInterval: 120000, dedupingInterval: 20000 }
  )
  const { data: otherStores, isLoading: otherStoresLoading } = useSWR(
    'other-stores', 
    () => ApiClient.getOtherStores(),
    { refreshInterval: 60000, dedupingInterval: 10000 }
  )

  // Handle both old format (array) and new format (object with data and pagination)
  const queriesData = queries?.data || (Array.isArray(queries) ? queries : [])
  
  const stats = [
    {
      title: 'Total Enquiries',
      value: Array.isArray(queriesData) ? queriesData.length : 0,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
      loading: queriesLoading
    },
    {
      title: 'Active Stores',
      value: Array.isArray(stores) ? stores.length : 0,
      icon: Store,
      color: 'text-green-600 bg-green-100',
      loading: storesLoading
    },
    {
      title: 'Pending Enquiries',
      value: Array.isArray(queriesData) ? queriesData.filter((q: any) => q.status === 'pending').length : 0,
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-100',
      loading: queriesLoading
    },
    {
      title: 'Store Approvals',
      value: Array.isArray(otherStores) ? otherStores.length : 0,
      icon: Users,
      color: 'text-red-600 bg-red-100',
      loading: otherStoresLoading
    }
  ]

  const recentQueries = Array.isArray(queriesData) ? queriesData.slice(0, 5) : []
  const pendingStoreApprovals = Array.isArray(otherStores) ? otherStores.slice(0, 3) : []

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, stores, and system-wide operations
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" asChild>
            <Link href="/admin/stores">
              <Store size={16} className="mr-2" />
              Manage Stores
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users">
              <Users size={16} className="mr-2" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Enquiries</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/staff/queries">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {queriesLoading ? (
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
                <p className="text-muted-foreground">No enquiries yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentQueries.map((query: any) => (
                  <div
                    key={query.id}
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
                        {query.service?.name} • {query.user?.email}
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
                        <Link href={`/admin/queries/${query.id}`} prefetch={true}>
                          <Eye size={14} className="mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Store Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Store Approvals</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/stores">Manage Stores</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {otherStoresLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingStoreApprovals.length === 0 ? (
              <div className="text-center py-8">
                <Store size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending store approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingStoreApprovals.map((query: any) => (
                  <div
                    key={query.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {query.other_store?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {query.other_store?.owner_email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Query: {query.reference_id}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/stores">
                          <Eye size={14} className="mr-1" />
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}