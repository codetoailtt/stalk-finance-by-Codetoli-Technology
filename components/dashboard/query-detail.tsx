'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Store, 
  User, 
  Calendar, 
  IndianRupee, 
  Clock, 
  MessageSquare,
  Upload,
  Download,
  Check,
  X,
  Eye,
  Loader2,
  Trash2,
  Edit,
  Shield,
  CreditCard,
  Percent,
  QrCode
} from 'lucide-react'
import { ApiClient } from '@/lib/api-client'
import { getCurrentUser } from '@/lib/auth-secure'
import { supabaseSecure } from '@/lib/supabase-client'
import { generateUserTermsAcceptancePDF } from '@/lib/pdf-generator'
import { PaymentModal } from '@/components/ui/payment-modal'
import { EMIManagementModal } from '@/components/ui/emi-management-modal'
import { calculateMonthlyEMI, isEMIDueThisMonth, getCurrentMonthKey, getServiceFeeWithGST, isEMIComplete, getEMICompletionStatus, getPenaltyStartDate, isInPenaltyGracePeriod } from '@/lib/utils'
import useSWR, { mutate } from 'swr'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QueryProgress } from './query-progress'

interface QueryDetailProps {
  queryId: string
}

export function QueryDetail({ queryId }: QueryDetailProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [note, setNote] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null)
  const [downloadingTerms, setDownloadingTerms] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showEMIModal, setShowEMIModal] = useState(false)
  const [emiModalMode, setEMIModalMode] = useState<'start' | 'edit'>('start')
  const [paymentType, setPaymentType] = useState<'service_fee' | 'emi'>('service_fee')
  const [penaltyAmount, setPenaltyAmount] = useState(0)
  const [totalAmountDue, setTotalAmountDue] = useState(0)
  const lastPenaltyUpdateRef = useRef<number>(0)

  const { data: query, isLoading, error: fetchError } = useSWR(
    `query-${queryId}`,
    () => ApiClient.getQuery(queryId),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Reduce duplicate requests
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  )

  useEffect(() => {
    getCurrentUser().then(setProfile)
  }, [])

  // Calculate penalty and total amount due
  useEffect(() => {
    if (
      query?.emi_started &&
      query?.emi_date &&
      query?.principal_amount &&
      query?.emi_percent
    ) {
      // Only update penalty if EMI is not complete and EMI is due this month
      const emiComplete = isEMIComplete(query)
      const emiDue = isEMIDueThisMonth(query.emi_date, query.emi_payments)
      if (!emiComplete && emiDue) {
        // Only update penalty if not set or last update > 10min ago
        const now = Date.now()
        const penaltyIsStale =
          !query.penalty_amount ||
          now - lastPenaltyUpdateRef.current > 10 * 60 * 1000

        if (penaltyIsStale) {
          const updatePenalty = async () => {
            try {
              const result = await ApiClient.updatePenalty(queryId)
              const updatedPenalty = result?.penalty_amount ?? query.penalty_amount ?? 0
              const emiAmount = calculateMonthlyEMI(query.principal_amount, query.emi_percent, query.tenure_months || 12)
              setPenaltyAmount(updatedPenalty)
              setTotalAmountDue(emiAmount + updatedPenalty)
              lastPenaltyUpdateRef.current = Date.now()
              // Always revalidate after penalty update if penalty is non-zero
              if (updatedPenalty > 0) {
                mutate(`query-${queryId}`)
                mutate('queries')
              }
            } catch (error) {
              console.error('Failed to update penalty:', error)
            }
          }
          updatePenalty()
        } else {
          // Use existing penalty if not stale
          const emiAmount = calculateMonthlyEMI(query.principal_amount, query.emi_percent, query.tenure_months || 12)
          const currentPenalty = query.penalty_amount || 0
          setPenaltyAmount(currentPenalty)
          setTotalAmountDue(emiAmount + currentPenalty)
        }
      } else {
        // If EMI is not due or is complete, just use current penalty and EMI
        const emiAmount = calculateMonthlyEMI(query.principal_amount, query.emi_percent, query.tenure_months || 12)
        const currentPenalty = query.penalty_amount || 0
        setPenaltyAmount(currentPenalty)
        setTotalAmountDue(emiAmount + currentPenalty)
      }
    }
  }, [query])

  const handleStatusUpdate = async (newStatus: string, noteText?: string) => {
    setLoading(newStatus)
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.updateQuery(queryId, {
        status: newStatus,
        note: noteText || note
      })

      setSuccess(`Query ${newStatus.replace('_', ' ')} successfully!`)
      setNote('')
      setShowStatusDialog(false)
      setShowNoteDialog(false)
      
      // Refresh data
      ApiClient.clearCache('queries')
      mutate(`query-${queryId}`)
      
      // Also refresh the queries list if it exists
      mutate('queries')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteQuery = async () => {
    setLoading('delete')
    setError('')
    setSuccess('')

    try {
      await ApiClient.deleteQuery(queryId)
      setSuccess('Query deleted successfully!')
      
      setTimeout(() => {
        router.push('/dashboard/queries')
      }, 2000)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
      setShowDeleteDialog(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.uploadFile(file, queryId)

      setSuccess('File uploaded successfully!')
      
      // Refresh data
      ApiClient.clearCache('queries')
      mutate(`query-${queryId}`)
      mutate('queries')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDocumentDownload = async (documentId: string, filename: string) => {
    setDownloadingDoc(documentId)
    setError('')

    try {
      const response = await ApiClient.downloadDocument(documentId)
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message || 'Download failed')
    } finally {
      setDownloadingDoc(null)
    }
  }

  const handleDownloadTermsAcceptance = async () => {
    if (!query) return
    
    setDownloadingTerms(true)
    try {
      await generateUserTermsAcceptancePDF(query)
    } catch (err: any) {
      setError(`Failed to download terms acceptance: ${err.message}`)
    } finally {
      setDownloadingTerms(false)
    }
  }

  const handleServiceFeePayment = () => {
    setPaymentType('service_fee')
    setShowPaymentModal(true)
  }

  const handleEMIPayment = () => {
    setPaymentType('emi')
    setShowPaymentModal(true)
  }

  const handleMarkServiceFeePaid = async (paid: boolean) => {
    setLoading('service-fee')
    setError('')
    setSuccess('')

    try {
      await ApiClient.markServiceFeePaid(queryId, paid)
      setSuccess(`Service fee marked as ${paid ? 'paid' : 'unpaid'}!`)
      mutate(`query-${queryId}`)
      mutate('queries')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleStartEMI = async (emiDate: number, emiPercent: number, tenureMonths: number) => {
    setLoading('start-emi')
    try {
      await ApiClient.startEMI(queryId, emiDate, emiPercent, tenureMonths)
      setSuccess('EMI started successfully!')
      mutate(`query-${queryId}`)
      mutate('queries')
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateEMISettings = async (emiDate: number, emiPercent: number, tenureMonths: number) => {
    setLoading('update-emi')
    try {
      await ApiClient.updateEMISettings(queryId, emiDate, emiPercent, tenureMonths)
      setSuccess('EMI settings updated successfully!')
      mutate(`query-${queryId}`)
      mutate('queries')
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(null)
    }
  }

  const handleMarkEMIPaid = async () => {
    if (!query?.emi_date || !query?.principal_amount || !query?.emi_percent) return
    
    setLoading('mark-emi-paid')
    setError('')
    setSuccess('')

    try {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      const emiAmount = calculateMonthlyEMI(query.principal_amount, query.emi_percent, query.tenure_months || 12)
      
      await ApiClient.markEMIPaid(queryId, currentMonth, emiAmount)
      setSuccess('EMI marked as paid for this month!')
      mutate(`query-${queryId}`)
      mutate('queries')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleWaivePenalty = async () => {
    setLoading('waive-penalty')
    setError('')
    setSuccess('')

    try {
      await ApiClient.waivePenalty(queryId)
      setSuccess('Penalty waived successfully!')
      mutate(`query-${queryId}`)
      mutate('queries')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const openStatusDialog = (status: string) => {
    setSelectedStatus(status)
    if (status === 'rejected') {
      setShowNoteDialog(true)
    } else {
      setShowStatusDialog(true)
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

  const getAvailableStatusTransitions = () => {
    if (!profile || !query) return []

    const currentStatus = query.status
    const isAdmin = profile.role === 'admin'
    const isStaff = profile.role === 'staff'
    const isStaffOrAdmin = profile.role === 'staff' || profile.role === 'admin'
    const isOwner = profile.id === query.user_id

    const transitions = []

    if (isStaffOrAdmin) {
      switch (currentStatus) {
        case 'pending':
          transitions.push('under_review')
          transitions.push('approved', 'rejected')
          break
        case 'under_review':
          transitions.push('approved', 'rejected')
          break
        case 'approved':
          if (isAdmin) transitions.push('completed', 'rejected')
          break
        case 'rejected':
          transitions.push('pending', 'under_review')
          break
        case 'completed':
          if (isAdmin) transitions.push('approved')
          break
      }
    }

    return transitions
  }

  const canDelete = profile?.role === 'admin' || profile?.id === query?.user_id
  const canChangeStatus = profile?.role === 'staff' || profile?.role === 'admin'
  const canUpload = profile?.id === query?.user_id && query?.status === 'approved'
  const isOwner = profile?.id === query?.user_id

  // Payment and EMI logic
  const serviceFee = getServiceFeeWithGST()
  const emiComplete = query ? isEMIComplete(query) : false
  const emiStatus = query ? getEMICompletionStatus(query) : null
  const isEMIDue = query?.emi_started && query?.emi_date && !emiComplete && isEMIDueThisMonth(query.emi_date, query.emi_payments)
  const currentMonthEMI = query?.emi_started && query?.principal_amount && query?.emi_percent 
    ? calculateMonthlyEMI(query.principal_amount, query.emi_percent, query.tenure_months || 12) 
    : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }



  if (fetchError || !query) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load query details. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Enquiry Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText size={20} />
                <span>{query.reference_id}</span>
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Created on {new Date(query.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(query.status)}
              {(profile?.role === 'admin' || profile?.role === 'staff') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete Enquiry
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{query.user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{query.user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{query.service?.name}</p>
                <p className="text-xs text-muted-foreground">${query.service?.base_fee}</p>
              </div>
            </div>
            
            {/* Service Fee Status */}
            <div className="flex items-center space-x-2">
              <CreditCard size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Service Fee</p>
                <p className={`text-xs ${query.service_fee_paid ? 'text-green-600' : 'text-red-600'}`}>
                  {query.service_fee_paid ? 'Paid' : 'Unpaid'}
                </p>
              </div>
            </div>

            {/* EMI Status */}
            {query.emi_started && !emiComplete && (
              <div className="flex items-center space-x-2">
                <Percent size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">EMI Status</p>
                  <p className={`text-xs ${isEMIDue ? 'text-red-600' : 'text-green-600'}`}>
                    {isEMIDue ? 'Due This Month' : 'Up to Date'}
                  </p>
                  {query.penalty_amount > 0 && (
                    <p className="text-xs text-red-600">
                      Penalty: ₹{query.penalty_amount}
                    </p>
                  )}
                  {/* Show grace period info if overdue but not yet penalized */}
                  {isEMIDue && isInPenaltyGracePeriod(query.emi_date) && (
                    <p className="text-xs text-orange-600">
                      Grace period active. Penalty will start from {getPenaltyStartDate(query.emi_date).toLocaleDateString()}.
                    </p>
                  )}
                  {/* Show penalty start date if penalty is active */}
                  {query.penalty_amount > 0 && query.penalty_started_at && (
                    <p className="text-xs text-red-700">
                      Penalty started on: {new Date(query.penalty_started_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* EMI Complete Status */}
            {query.emi_started && emiComplete && (
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-600">EMI Complete</p>
                  <p className="text-xs text-green-600">
                    All payments received
                  </p>
                </div>
              </div>
            )}

            {query.store && (
  <div className="flex items-center space-x-2">
    <Store size={16} className="text-muted-foreground" />
    <div>
      {query.terms_accepted && query.terms_accepted_at && (
        <span>
          Terms Accepted: {new Date(query.terms_accepted_at).toLocaleDateString()}
        </span>
      )}
      <p className="text-sm font-medium">{query.store.name}</p>
      <p className="text-xs text-muted-foreground">{query.store.owner_name}</p>

      {(profile?.role === 'staff' || profile?.role === 'admin') &&
        query.terms_accepted && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTermsAcceptance}
            disabled={downloadingTerms}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 mt-2"
          >
            {downloadingTerms ? (
              <>
                <Loader2 size={14} className="mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Shield size={14} className="mr-1" />
                Terms Accepted
              </>
            )}
          </Button>
        )}
    </div>
  </div>
)}

            {query.amount && (
              <div className="flex items-center space-x-2">
                <IndianRupee size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">₹{query.amount}</p>
                  <p className="text-xs text-muted-foreground">Amount</p>
                </div>
              </div>
            )}

            {query.tenure_months && (
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{query.tenure_months} months</p>
                  <p className="text-xs text-muted-foreground">Tenure</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Query Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Enquiry Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {query.purpose && (
              <div>
                <Label className="text-sm font-medium">Purpose</Label>
                <p className="text-sm text-muted-foreground mt-1">{query.purpose}</p>
              </div>
            )}
            
            {query.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{query.description}</p>
              </div>
            )}
            
            {query.other_service && (
              <div>
                <Label className="text-sm font-medium">Custom Product/Service</Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">{query.other_service}</p>
                </div>
              </div>
            )}
            
            {query.timeline && (
              <div>
                <Label className="text-sm font-medium">Timeline</Label>
                <p className="text-sm text-muted-foreground mt-1">{query.timeline}</p>
              </div>
            )}

            {query.other_store && (
              <div>
                <Label className="text-sm font-medium">Requested Store</Label>
                <div className="mt-1 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-orange-800">{query.other_store.name}</p>
                  <p className="text-xs text-orange-600">{query.other_store.owner_email}</p>
                  <p className="text-xs text-orange-600">{query.other_store.owner_phone}</p>
                  {query.other_store.address && (
                    <p className="text-xs text-orange-600">{query.other_store.address}</p>
                  )}
                  <p className="text-xs text-orange-600 mt-1">Pending admin approval</p>
                </div>
              </div>
            )}

            {query.terms_accepted && query.terms_accepted_at && (
              <div>
                <Label className="text-sm font-medium">Terms Acceptance</Label>
                <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Terms Accepted</p>
                  <p className="text-xs text-green-600">
                    Accepted on: {new Date(query.terms_accepted_at).toLocaleString()}
                  </p>
                  {(profile?.role === 'staff' || profile?.role === 'admin') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadTermsAcceptance}
                      disabled={downloadingTerms}
                      className="mt-2 h-6 px-2 text-xs text-green-700 hover:bg-green-100"
                    >
                      {downloadingTerms ? (
                        <>
                          <Loader2 size={12} className="mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download size={12} className="mr-1" />
                          Download Proof
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Payment Actions */}
            {isOwner && query.status === 'approved' && !query.service_fee_paid && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Service Fee Payment</Label>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Payment Required</p>
                      <p className="text-xs text-yellow-600">
                        Service Fee: ₹{serviceFee.baseFee} + GST: ₹{serviceFee.gst} = ₹{serviceFee.total}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleServiceFeePayment}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <QrCode size={14} className="mr-2" />
                    Pay ₹{serviceFee.total}
                  </Button>
                </div>
              </div>
            )}

            {/* User EMI Payment */}
            {isOwner && query.emi_started && !emiComplete && isEMIDue && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">EMI Payment</Label>
                <div className={`p-4 rounded-lg border ${query.penalty_amount > 0 ? 'bg-red-100 border-red-300' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-red-800">EMI Due This Month</p>
                      <p className="text-xs text-red-600">
                        Due Date: {query.emi_date} of every month
                      </p>
                      {query.penalty_amount > 0 && (
                        <p className="text-xs text-red-700 font-medium">
                          Penalty: ₹{query.penalty_amount} (Total: ₹{currentMonthEMI + query.penalty_amount})
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={handleEMIPayment}
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    <QrCode size={14} className="mr-2" />
                    Pay {query.penalty_amount > 0 ? `₹${currentMonthEMI + query.penalty_amount} (EMI + Penalty)` : `EMI ₹${currentMonthEMI}`}
                  </Button>
                </div>
              </div>
            )}

            {/* Staff/Admin Service Fee Management */}
            {canChangeStatus && query.status === 'approved' && !query.service_fee_paid && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Service Fee Management</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkServiceFeePaid(true)}
                    disabled={loading === 'service-fee'}
                    className="flex-1"
                  >
                    {loading === 'service-fee' ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <Check size={14} className="mr-1" />
                    )}
                    Mark Paid
                  </Button>
                </div>
              </div>
            )}

            {/* Staff/Admin EMI Management */}
            {canChangeStatus && query.service_fee_paid && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">EMI Management</Label>
                
                {query.emi_started_at && !query.emi_started && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      EMI will automatically start on {new Date(query.emi_started_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {(!query.emi_started_at || (!query.emi_started && !query.emi_date)) ? (
                  <Button
                    onClick={() => {
                      setEMIModalMode('start')
                      setShowEMIModal(true)
                    }}
                    disabled={loading === 'start-emi'}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {loading === 'start-emi' ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Percent size={14} className="mr-2" />
                        Start EMI
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setEMIModalMode('edit')
                      setShowEMIModal(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Edit size={14} className="mr-2" />
                    Edit EMI Settings
                  </Button>
                )}
              </div>
            )}

            {/* EMI Settings and Payment Management */}
            {canChangeStatus && query.emi_started && !emiComplete && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">EMI Settings</Label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between mb-1">
                      <span>EMI Date:</span>
                      <span className="font-medium">{query.emi_date} of every month</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Interest Rate:</span>
                      <span className="font-medium">{query.emi_percent}% per annum</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Tenure:</span>
                      <span className="font-medium">{query.tenure_months || 12} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly EMI:</span>
                      <span className="font-medium text-blue-600">₹{currentMonthEMI}</span>
                    </div>
                    {query.penalty_amount > 0 && (
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span>Current Penalty:</span>
                        <span className="font-medium text-red-600">₹{query.penalty_amount}</span>
                      </div>
                    )}
                    {query.penalty_waived && (
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span>Penalty Status:</span>
                        <span className="font-medium text-green-600">Waived</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEMIModalMode('edit')
                      setShowEMIModal(true)
                    }}
                    className="w-full"
                  >
                    <Edit size={14} className="mr-2" />
                    Edit EMI Settings
                  </Button>
                </div>

                {/* Penalty Management */}
                {query.penalty_amount > 0 && canChangeStatus && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Penalty Management</Label>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-red-800">Penalty Started</span>
                        <span className="font-medium text-red-800">₹{query.penalty_amount}</span>
                      </div>
                      {query.penalty_started_at && (
                        <p className="text-xs text-red-600 mb-2">
                          Started: {new Date(query.penalty_started_at).toLocaleDateString()}
                        </p>
                      )}
                      {query.penalty_waived_by && (
                        <p className="text-xs text-green-600 mb-2">
                          Waived by admin/staff
                        </p>
                      )}
                      <Button
                        onClick={handleWaivePenalty}
                        disabled={loading === 'waive-penalty'}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        {loading === 'waive-penalty' ? (
                          <>
                            <Loader2 size={14} className="mr-2 animate-spin" />
                            Waiving...
                          </>
                        ) : (
                          <>
                            <X size={14} className="mr-2" />
                            Waive Penalty
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Current Month EMI Payment */}
                {isEMIDue && !emiComplete && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Month EMI</Label>
                    <Button
                      onClick={handleMarkEMIPaid}
                      disabled={loading === 'mark-emi-paid'}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      {loading === 'mark-emi-paid' ? (
                        <>
                          <Loader2 size={14} className="mr-2 animate-spin" />
                          Marking...
                        </>
                      ) : (
                        <>
                          <Check size={14} className="mr-2" />
                          Mark EMI Paid (₹{currentMonthEMI + (query.penalty_amount || 0)})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* EMI Completion Status for Staff/Admin */}
            {canChangeStatus && query.emi_started && emiComplete && emiStatus && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">EMI Completion Status</Label>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">EMI Complete</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Paid:</span>
                      <span className="font-medium text-green-800">₹{emiStatus.totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Expected Total:</span>
                      <span className="font-medium text-green-800">₹{emiStatus.totalExpected.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Completion:</span>
                      <span className="font-medium text-green-800">{emiStatus.completionPercentage.toFixed(1)}%</span>
                    </div>
                    {emiStatus.remainingAmount > 0 && (
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-orange-700">Remaining:</span>
                        <span className="font-medium text-orange-800">₹{emiStatus.remainingAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-3">
                    {query.status === 'completed' 
                      ? 'Query marked as completed - EMI considered complete'
                      : 'All EMI payments have been received'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Status Change Actions */}
            {canChangeStatus && getAvailableStatusTransitions().length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Change Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableStatusTransitions().map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusDialog(status)}
                      disabled={loading === status}
                      className={
                        status === 'approved' ? 'border-green-200 text-green-700 hover:bg-green-50' :
                        status === 'rejected' ? 'border-red-200 text-red-700 hover:bg-red-50' :
                        status === 'completed' ? 'border-blue-200 text-blue-700 hover:bg-blue-50' :
                        'border-purple-200 text-purple-700 hover:bg-purple-50'
                      }
                    >
                      {loading === status ? (
                        <>
                          <Loader2 size={14} className="mr-1 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {status === 'approved' && <Check size={14} className="mr-1" />}
                          {status === 'rejected' && <X size={14} className="mr-1" />}
                          {status === 'under_review' && <Eye size={14} className="mr-1" />}
                          {status === 'completed' && <Check size={14} className="mr-1" />}
                          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* User Upload Actions */}
            {canUpload && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Upload Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer ${uploadingFile ? 'opacity-50' : ''}`}
                  >
                    {uploadingFile ? (
                      <div className="flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin mr-2" />
                        Uploading...
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload documents
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, DOCX, JPG, PNG, WEBP (max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* EMI Payment History */}
      {query.emi_started && query.emi_payments && Object.keys(query.emi_payments).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>EMI Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(query.emi_payments)
                .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
                .map(([key, payment]: [string, any]) => {
                  const [year, month, day] = key.split('-')
                  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {monthName} {year} - EMI Paid
                        </p>
                        <p className="text-xs text-green-600">
                          Paid on: {new Date(payment.paid_at).toLocaleDateString()}
                        </p>
                        {payment.penalty_included && (
                          <p className="text-xs text-orange-600">
                            (Included penalty: ₹{payment.penalty_amount})
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-800">₹{payment.amount}</p>
                        <p className="text-xs text-green-600">Due: {day}th</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* EMI Progress Section - only for staff/admin, after payment history */}
      {canChangeStatus && emiStatus && (
        <QueryProgress completionStatus={emiStatus} />
      )}

      {/* Documents */}
      {query.documents && query.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {query.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.original_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB • 
                        {new Date(doc.created_at).toLocaleDateString()}
                        {doc.compressed && ' • Compressed'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDocumentDownload(doc.id, doc.original_filename)}
                    disabled={downloadingDoc === doc.id}
                  >
                    {downloadingDoc === doc.id ? (
                      <>
                        <Loader2 size={14} className="mr-1 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={14} className="mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {query.notes && query.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notes & Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {query.notes.map((note: any) => (
                <div key={note.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">
                      {note.created_by_profile?.full_name || note.created_by_profile?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to change the status to "{selectedStatus.replace('_', ' ')}"?
            </p>
            
            <div>
              <Label htmlFor="status-note">Add a note (optional)</Label>
              <Textarea
                id="status-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status change..."
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleStatusUpdate(selectedStatus)}
                disabled={loading === selectedStatus}
              >
                {loading === selectedStatus ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enquiry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-note">Reason for rejection *</Label>
              <Textarea
                id="rejection-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={loading === 'rejected' || !note.trim()}
                variant="destructive"
              >
                {loading === 'rejected' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Enquiry'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enquiry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this enquiry? This action cannot be undone and will also delete all associated documents and notes.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-800">{query.reference_id}</p>
              <p className="text-sm text-red-600">{query.service?.name}</p>
              <p className="text-sm text-red-600">
                {query.documents?.length || 0} documents will be deleted
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDeleteQuery}
                disabled={loading === 'delete'}
              >
                {loading === 'delete' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Enquiry'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={paymentType === 'service_fee' ? serviceFee.total : currentMonthEMI + (query?.penalty_amount || 0)}
        penaltyAmount={paymentType === 'emi' ? (query?.penalty_amount || 0) : 0}
        queryId={query.reference_id}
        type={paymentType}
      />

      {/* EMI Management Modal */}
      <EMIManagementModal
        open={showEMIModal}
        onOpenChange={setShowEMIModal}
        onSubmit={emiModalMode === 'start' ? handleStartEMI : handleUpdateEMISettings}
        loading={loading === 'start-emi' || loading === 'update-emi'}
        mode={emiModalMode}
        currentEmiDate={query?.emi_date}
        currentEmiPercent={query?.emi_percent}
        currentTenureMonths={query?.tenure_months}
        principalAmount={query?.principal_amount || query?.amount || 50000}
      />
    </div>
  )
}