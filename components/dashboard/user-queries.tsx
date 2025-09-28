'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Plus, Search, Filter, Eye, Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api-client'
import { isEMIDueThisMonth, isEMIComplete } from '@/lib/utils'
import useSWR from 'swr'

export function UserQueries() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data: queries, isLoading } = useSWR(
    `queries-page-${currentPage}`, 
    () => ApiClient.getQueries(currentPage),
    {
      refreshInterval: 60000, // Reduce refresh frequency
      revalidateOnFocus: true,
      dedupingInterval: 10000
    }
  )

  // Handle both old format (array) and new format (object with data and pagination)
  const queriesData = queries?.data || (Array.isArray(queries) ? queries : [])
  const pagination = queries?.pagination
  const userQueries = Array.isArray(queriesData) ? queriesData : []

  const filteredQueries = userQueries.filter(query => {
    const matchesSearch = 
      query.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    
    if (statusFilter === 'all') {
      matchesStatus = true
    } else if (statusFilter === 'service_fee_unpaid') {
      matchesStatus = query.status === 'approved' && !query.service_fee_paid
    } else if (statusFilter === 'emi_unpaid') {
      matchesStatus = query.emi_started && query.emi_date && !isEMIComplete(query) && isEMIDueThisMonth(query.emi_date, query.emi_payments)
    } else {
      matchesStatus = query.status === statusFilter
    }
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-orange-600" />
      case 'under_review':
        return <AlertCircle size={16} className="text-purple-600" />
      case 'approved':
        return <CheckCircle size={16} className="text-green-600" />
      case 'rejected':
        return <AlertCircle size={16} className="text-red-600" />
      default:
        return <FileText size={16} className="text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
      case 'under_review':
        return <Badge className="bg-purple-100 text-purple-800">Under Review</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const canUploadDocuments = (status: string) => {
    return status === 'approved'
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Enquiries</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track and manage your finance enquiries
          </p>
        </div>
        
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/queries/new">
            <Plus size={16} className="mr-2" />
            New Enquiry
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="sm:col-span-2">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by reference ID, service, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="service_fee_unpaid">Service Fee Unpaid</SelectItem>
            <SelectItem value="emi_unpaid">EMI Unpaid</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-muted-foreground">
          <span>Total: {filteredQueries.length}</span>
        </div>
      </div>

      {/* Queries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <div className="flex items-center space-x-2">
              <FileText size={20} />
              <span>All Enquiries</span>
            </div>
            <Badge variant="secondary" className="w-fit">{filteredQueries.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : filteredQueries.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' ? 'No enquiries found matching your filters' : 'No enquiries yet'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/dashboard/queries/new">Create Your First Enquiry</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {filteredQueries.map((query: any, index: number) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors w-full"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(query.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">
                        {query.reference_id}
                      </p>
                      {getStatusBadge(query.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {query.service?.name || query.other_service}
                      {query.store?.name && ` • ${query.store.name}`}
                      {query.other_store?.name && ` • ${query.other_store.name} (Pending Approval)`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Created: {new Date(query.created_at).toLocaleDateString()}</span>
                      {query.amount && <span>Amount: ₹{query.amount}</span>}
                      {query.timeline && <span>Timeline: {query.timeline}</span>}
                      {query.status === 'approved' && (
                        <span className={query.service_fee_paid ? 'text-green-600' : 'text-red-600'}>
                          Service Fee: {query.service_fee_paid ? 'Paid' : 'Unpaid'}
                        </span>
                      )}
                      {query.emi_started && (
                        <span className={
                          isEMIComplete(query) ? 'text-green-600' :
                          isEMIDueThisMonth(query.emi_date, query.emi_payments) ? 'text-red-600' : 'text-green-600'
                        }>
                          EMI: {
                            isEMIComplete(query) ? 'Complete' :
                            isEMIDueThisMonth(query.emi_date, query.emi_payments) ? 'Due' : 'Paid'
                          }
                        </span>
                      )}
                      {query.penalty_amount > 0 && (
                        <span className="text-red-600">
                          Penalty: ₹{query.penalty_amount}
                        </span>
                      )}
                    </div>
                    {query.purpose && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        Purpose: {query.purpose}
                      </p>
                    )}
                    {query.other_service && (
                      <p className="text-xs text-blue-600 mt-1 line-clamp-1">
                        Custom: {query.other_service}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                      <Link href={`/dashboard/queries/${query.id}`} prefetch={true}>
                        <Eye size={14} className="mr-1" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      


           {pagination && pagination.total > 1000 && (
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} enquiries
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrev || isLoading}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!pagination.hasNext || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
      )}
    </div>
  )
}