'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Search, Filter, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { isEMIDueThisMonth, isEMIComplete } from '@/lib/utils'

import { ApiClient } from '@/lib/api-client'

export function StaffQueries() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data: queriesResponse, isLoading } = useSWR(
    `queries-page-${currentPage}`, 
    () => ApiClient.getQueries(currentPage),
    {
      refreshInterval: 60000, // Reduce refresh frequency
      revalidateOnFocus: true,
      dedupingInterval: 10000
    }
  )

  // Handle both old format (array) and new format (object with data and pagination)
  const queries = queriesResponse?.data || (Array.isArray(queriesResponse) ? queriesResponse : [])
  const pagination = queriesResponse?.pagination
  
  const filteredQueries = Array.isArray(queries) ? queries.filter(query => {
    const matchesSearch = 
      query.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
  }) : []

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

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Enquiries</h1>
          <p className="text-muted-foreground">
            Review and manage all user enquiries
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by reference ID, user email, or service..."
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

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Total: {filteredQueries.length} enquiries</span>
        </div>
      </div>

      {/* Enquiries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <FileText size={20} />
            <span>Enquiry List</span>
            <Badge variant="secondary">{filteredQueries.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
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
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'No enquiries found matching your filters' : 'No enquiries found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {filteredQueries.map((query: any, index: number) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors w-full"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getStatusIcon(query.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-foreground">
                        {query.reference_id}
                      </p>
                      {getStatusBadge(query.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {query.service?.name || query.other_service} • {query.user?.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
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
                      {query.penalty_waived && (
                        <span className="text-green-600">
                          Penalty Waived
                        </span>
                      )}
                      {query.other_service && (
                        <span className="text-blue-600">
                          Custom Service
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        {pagination && pagination.total > 1000 && (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} enquiries
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrev || isLoading}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
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
          </>
        )}
      </div>
    </div>
  )
}