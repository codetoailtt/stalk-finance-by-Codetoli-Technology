'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TermsModal } from '@/components/ui/terms-modal'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { IndianRupee } from 'lucide-react'
import Link from 'next/link'
import { ApiClient } from '@/lib/api-client'
import { sanitizeString } from '@/lib/validation'
import useSWR from 'swr'

export function NewQueryForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showOtherStore, setShowOtherStore] = useState(false)
  const [showOtherService, setShowOtherService] = useState(false)
  const [showCustomTenure, setShowCustomTenure] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState(false)

  const [formData, setFormData] = useState({
    service_id: '',
    store_id: '',
    amount: '',
    tenure_months: '12',
    custom_tenure: '',
    timeline: '',
    purpose: '',
    description: '',
    other_service: '',
    // Other store fields
    other_store_name: '',
    other_owner_email: '',
    other_owner_phone: '',
    other_store_address: ''
  })

  const { data: services, isLoading: servicesLoading } = useSWR(
    'services', 
    () => ApiClient.getServices(),
    {
      refreshInterval: 600000, // 10 minutes - services don't change often
      dedupingInterval: 120000
    }
  )
  const { data: stores, isLoading: storesLoading } = useSWR(
    'stores', 
    () => ApiClient.getStores(),
    {
      refreshInterval: 120000,
      dedupingInterval: 20000
    }
  )

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input before setting
    const sanitizedValue = sanitizeString(value)
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }))
    
    // Show/hide other store fields based on selection
    if (field === 'store_id') {
      setShowOtherStore(sanitizedValue === 'other')
      if (sanitizedValue !== 'other') {
        setFormData(prev => ({
          ...prev,
          other_store_name: '',
          other_owner_email: '',
          other_owner_phone: '',
          other_store_address: ''
        }))
      }
    }
    
    // Show/hide other service fields based on selection
    if (field === 'service_id') {
      setShowOtherService(sanitizedValue === 'other')
      if (sanitizedValue !== 'other') {
        setFormData(prev => ({ ...prev, other_service: '' }))
      }
    }
    
    // Show/hide custom tenure fields based on selection
    if (field === 'tenure_months') {
      setShowCustomTenure(sanitizedValue === 'other')
      if (sanitizedValue !== 'other') {
        setFormData(prev => ({ ...prev, custom_tenure: '' }))
      }
    }
  }

  const validateForm = () => {
    if (!formData.service_id) {
      setError('Please select a product or describe a custom service')
      return false
    }
    
    if (showOtherService && !formData.other_service.trim()) {
      setError('Please describe your custom service')
      return false
    }

    if (!formData.store_id) {
      setError('Please select a store')
      return false
    }
    
    if (showCustomTenure) {
      const customTenure = parseInt(formData.custom_tenure)
      if (!customTenure || customTenure < 1 || customTenure > 60) {
        setError('Please enter a valid tenure between 1 and 60 months')
        return false
      }
    }

    if (showOtherStore) {
      if (!formData.other_store_name || !formData.other_owner_email || !formData.other_owner_phone || !formData.other_store_address) {
        setError('Please fill in all other store details including address')
        return false
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.other_owner_email)) {
        setError('Please enter a valid email address')
        return false
      }

      // Basic phone validation
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(formData.other_owner_phone.replace(/[\s\-\(\)]/g, ''))) {
        setError('Please enter a valid phone number')
        return false
      }
    }

    return true
  }

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    // Show terms modal before actual submission
    setShowTermsModal(true)
  }

  const handleTermsAccepted = async () => {
    setShowTermsModal(false)
    setPendingSubmission(true)
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const payload: any = {
        service_id: showOtherService ? null : (formData.service_id || null),
        other_service: showOtherService ? formData.other_service.trim() : null,
        store_id: showOtherStore ? 'other' : formData.store_id,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        tenure_months: showCustomTenure ? parseInt(formData.custom_tenure) : parseInt(formData.tenure_months),
        timeline: formData.timeline || null,
        purpose: formData.purpose || null,
        description: formData.description || null,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString()
      }

      if (showOtherStore) {
        payload.other_store = {
          name: formData.other_store_name,
          owner_email: formData.other_owner_email,
          owner_phone: formData.other_owner_phone,
          address: formData.other_store_address
        }
      }

      const result = await ApiClient.createQuery(payload)

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/queries')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setPendingSubmission(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/dashboard/queries">
            <ArrowLeft size={16} className="mr-2" />
            Back to Enquiries
          </Link>
        </Button>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">New Enquiry</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Submit a new finance enquiry for processing
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Enquiry submitted successfully! Redirecting to your enquiries...
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInitialSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Selection */}
              <div>
                <Label htmlFor="service">Product *</Label>
                <Select 
                  value={formData.service_id} 
                  onValueChange={(value) => handleInputChange('service_id', value)}
                  disabled={servicesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={servicesLoading ? "Loading products..." : "Select a product"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(services) && services.map((service: any) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                          <span>{service.name}</span>
                          <span className="text-xs text-muted-foreground sm:ml-2">₹{service.base_fee}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (Custom Service)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Store Selection */}
              <div>
                <Label htmlFor="store">Store *</Label>
                <Select 
                  value={formData.store_id} 
                  onValueChange={(value) => handleInputChange('store_id', value)}
                  disabled={storesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={storesLoading ? "Loading stores..." : "Select a store"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(stores) && stores.map((store: any) => (
                      <SelectItem key={store.id} value={store.id}>
                        <div className="flex flex-col">
                          <span>{store.name}</span>
                          <span className="text-xs text-muted-foreground">({store.owner_name})</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (Request new store)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Other Service Fields */}
            {showOtherService && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:col-span-2 space-y-4 p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <h3 className="font-semibold text-foreground">Custom Service Details</h3>
                <div>
                  <Label htmlFor="other_service">Describe your custom product/service *</Label>
                  <Textarea
                    id="other_service"
                    value={formData.other_service}
                    onChange={(e) => handleInputChange('other_service', e.target.value)}
                    placeholder="Describe your custom product/service requirement in detail"
                    rows={3}
                  />
                </div>
                <p className="text-sm text-green-700">
                  Please provide detailed information about your custom service requirement.
                </p>
              </motion.div>
            )}

            {/* Other Store Fields */}
            {showOtherStore && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <h3 className="font-semibold text-foreground">New Store Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="other_store_name">Store Name *</Label>
                    <Input
                      id="other_store_name"
                      value={formData.other_store_name}
                      onChange={(e) => handleInputChange('other_store_name', e.target.value)}
                      placeholder="Enter store name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="other_owner_email">Owner Email *</Label>
                    <Input
                      id="other_owner_email"
                      type="email"
                      value={formData.other_owner_email}
                      onChange={(e) => handleInputChange('other_owner_email', e.target.value)}
                      placeholder="owner@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="other_owner_phone">Owner Phone *</Label>
                    <Input
                      id="other_owner_phone"
                      type="tel"
                      value={formData.other_owner_phone}
                      onChange={(e) => handleInputChange('other_owner_phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="other_store_address">Store Address *</Label>
                    <Input
                      id="other_store_address"
                      value={formData.other_store_address}
                      onChange={(e) => handleInputChange('other_store_address', e.target.value)}
                      placeholder="Enter complete store address"
                    />
                  </div>
                </div>
                <p className="text-sm text-blue-700">
                  This store will need admin approval before your enquiry can proceed.
                </p>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Enter amount (optional)"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tenure_months">Tenure</Label>
                <Select value={formData.tenure_months} onValueChange={(value) => handleInputChange('tenure_months', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="9">9 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="18">18 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                    <SelectItem value="36">36 Months</SelectItem>
                    <SelectItem value="48">48 Months</SelectItem>
                    <SelectItem value="60">60 Months</SelectItem>
                    <SelectItem value="other">Other (Custom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>
            </div>
            
            {/* Custom Tenure Fields */}
            {showCustomTenure && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200"
              >
                <h3 className="font-semibold text-foreground">Custom Tenure</h3>
                <div>
                  <Label htmlFor="custom_tenure">Enter tenure in months *</Label>
                  <Input
                    id="custom_tenure"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.custom_tenure}
                    onChange={(e) => handleInputChange('custom_tenure', e.target.value)}
                    placeholder="Enter number of months (1-60)"
                  />
                </div>
                <p className="text-sm text-purple-700">
                  Enter a custom tenure between 1 and 60 months.
                </p>
              </motion.div>
            )}
            
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="Brief purpose of the enquiry"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed description of your requirements"
                rows={4}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={loading || success || pendingSubmission} className="flex-1 sm:flex-none">
                {loading || pendingSubmission ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {pendingSubmission ? 'Processing...' : 'Submitting...'}
                  </>
                ) : (
                  'Submit Enquiry'
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1 sm:flex-none">
                <Link href="/dashboard/queries">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms Modal */}
      <TermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccept={handleTermsAccepted}
        loading={loading}
      />
    </div>
  )
}