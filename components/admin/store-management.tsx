'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Store, Plus, Check, X, Eye, Mail, Phone, Loader2, Trash2, Edit, MapPin, AlertTriangle } from 'lucide-react'
import useSWR, { mutate } from 'swr'

import { ApiClient } from '@/lib/api-client'

export function StoreManagement() {
  const [loading, setLoading] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteStoreDialog, setShowDeleteStoreDialog] = useState(false)
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<any>(null)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [deleteInfo, setDeleteInfo] = useState<any>(null)
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    address: '',
    owner_pancard: '',
    partner_name: '',
    partner_name_2: '',
    gstin_no: ''
  })
  const [editStoreData, setEditStoreData] = useState({
    name: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    address: '',
    owner_pancard: '',
    partner_name: '',
    partner_name_2: '',
    gstin_no: ''
  })

  const { data: stores, isLoading: storesLoading } = useSWR(
    'stores', 
    () => ApiClient.getStores(),
    {
      refreshInterval: 120000,
      dedupingInterval: 20000
    }
  )
  const { data: otherStores, isLoading: otherStoresLoading } = useSWR(
    'other-stores', 
    () => ApiClient.getOtherStores(),
    {
      refreshInterval: 60000,
      dedupingInterval: 10000
    }
  )

  const handleStoreAction = async (queryId: string, action: 'approve' | 'reject') => {
    setLoading(queryId)
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.approveStore(queryId, action)

      setSuccess(action === 'approve' ? 'Store approved successfully!' : 'Store request rejected')
      
      // Refresh data
      mutate('other-stores')
      mutate('stores')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteQuery = async () => {
    if (!selectedQuery) return
    
    setLoading(selectedQuery.id)
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.deleteQuery(selectedQuery.id)

      setSuccess('Query deleted successfully!')
      setShowDeleteDialog(false)
      setSelectedQuery(null)
      
      // Refresh data
      mutate('other-stores')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteStore = async (force = false) => {
    if (!selectedStore) return
    
    setLoading('delete-store')
    setError('')
    setSuccess('')

    try {
      await ApiClient.deleteStore(selectedStore.id)

      setSuccess('Store deleted successfully!')
      setShowDeleteStoreDialog(false)
      setShowForceDeleteDialog(false)
      setSelectedStore(null)
      setDeleteInfo(null)
      
      // Refresh data
      mutate('stores')
      
    } catch (err: any) {
      const errorData = JSON.parse(err.message)
      if (errorData.canForceDelete !== undefined) {
        setDeleteInfo(errorData)
        setShowDeleteStoreDialog(false)
        setShowForceDeleteDialog(true)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleDeactivateStore = async () => {
    if (!selectedStore) return
    setLoading('deactivate-store')
    setError('')
    setSuccess('')
    try {
      await ApiClient.updateStore(selectedStore.id, { active: false })
      setSuccess('Store deactivated successfully!')
      setShowDeleteStoreDialog(false)
      setShowForceDeleteDialog(false)
      setSelectedStore(null)
      setDeleteInfo(null)
      mutate('stores')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleEditStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.updateStore(selectedStore.id, editStoreData)

      setSuccess('Store updated successfully!')
      setShowEditDialog(false)
      setSelectedStore(null)
      
      // Refresh data
      mutate('stores')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.createStore(newStoreData)

      setSuccess('Store created successfully!')
      setShowCreateDialog(false)
      setNewStoreData({
        name: '',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        address: '',
        owner_pancard: '',
        partner_name: '',
        partner_name_2: '',
        gstin_no: ''
      })
      
      // Refresh data
      mutate('stores')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setNewStoreData(prev => ({ ...prev, [field]: value }))
  }

  const handleEditInputChange = (field: string, value: string) => {
    setEditStoreData(prev => ({ ...prev, [field]: value }))
  }

  const openEditDialog = (store: any) => {
    setSelectedStore(store)
    setEditStoreData({
      name: store.name || '',
      owner_name: store.owner_name || '',
      owner_email: store.owner_email || '',
      owner_phone: store.owner_phone || '',
      address: store.address || '',
      owner_pancard: store.owner_pancard || '',
      partner_name: store.partner_name || '',
      partner_name_2: store.partner_name_2 || '',
      gstin_no: store.gstin_no || ''
    })
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Store Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and approve store registrations
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus size={16} className="mr-2" />
              Add New Store
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Store Name *</Label>
                  <Input
                    id="name"
                    value={newStoreData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter store name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    value={newStoreData.owner_name}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    placeholder="Enter owner name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner_email">Owner Email *</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={newStoreData.owner_email}
                    onChange={(e) => handleInputChange('owner_email', e.target.value)}
                    placeholder="owner@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="owner_phone">Owner Phone</Label>
                  <Input
                    id="owner_phone"
                    type="tel"
                    value={newStoreData.owner_phone}
                    onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner_pancard">PAN Card Number</Label>
                  <Input
                    id="owner_pancard"
                    value={newStoreData.owner_pancard}
                    onChange={(e) => handleInputChange('owner_pancard', e.target.value)}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <Label htmlFor="partner_name">Agent Name</Label>
                  <Input
                    id="partner_name"
                    value={newStoreData.partner_name}
                    onChange={(e) => handleInputChange('partner_name', e.target.value)}
                    placeholder="Enter partner name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="partner_name_2">Agent Number</Label>
                <Input
                  id="partner_name_2"
                  value={newStoreData.partner_name_2}
                  onChange={(e) => handleInputChange('partner_name_2', e.target.value)}
                  placeholder="Enter second partner name"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newStoreData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter store address"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="gstin_no">GSTIN Number</Label>
                <Input
                  id="gstin_no"
                  value={newStoreData.gstin_no}
                  onChange={(e) => handleInputChange('gstin_no', e.target.value)}
                  placeholder="Enter GSTIN number (optional)"
                  maxLength={15}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={createLoading} className="flex-1">
                  {createLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Store'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Pending Store Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center space-x-2">
                <Store size={20} />
                <span>Pending Store Approvals</span>
              </div>
              <Badge variant="secondary" className="w-fit">
                {Array.isArray(otherStores) ? otherStores.length : 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {otherStoresLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 border rounded-lg">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !Array.isArray(otherStores) || otherStores.length === 0 ? (
              <div className="text-center py-8">
                <Store size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending store approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {otherStores.map((query: any) => (
                  <motion.div
                    key={query.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {query.other_store?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Query: {query.reference_id}
                          </p>
                        </div>
                        <Badge variant="outline" className="w-fit">Pending</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail size={14} className="text-muted-foreground flex-shrink-0" />
                          <span className="break-all">{query.other_store?.owner_email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone size={14} className="text-muted-foreground flex-shrink-0" />
                          <span>{query.other_store?.owner_phone}</span>
                        </div>
                        {query.other_store?.address && (
                          <div className="flex items-start space-x-2">
                            <MapPin size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-xs">{query.other_store.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStoreAction(query.id, 'approve')}
                          disabled={loading === query.id}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <Check size={14} className="mr-1" />
                          {loading === query.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStoreAction(query.id, 'reject')}
                          disabled={loading === query.id}
                          className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                        >
                          <X size={14} className="mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQuery(query)
                            setShowDeleteDialog(true)
                          }}
                          disabled={loading === query.id}
                          className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Stores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center space-x-2">
                <Store size={20} />
                <span>Active Stores</span>
              </div>
              <Badge variant="secondary" className="w-fit">
                {Array.isArray(stores) ? stores.length : 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !Array.isArray(stores) || stores.length === 0 ? (
              <div className="text-center py-8">
                <Store size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active stores</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {stores.map((store: any) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">
                            {store.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Owner: {store.owner_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="break-all">{store.owner_email}</span>
                            {store.owner_phone && <span>{store.owner_phone}</span>}
                          </div>
                          {store.owner_pancard && (
                            <p className="text-xs text-muted-foreground mt-1">
                              PAN: {store.owner_pancard}
                            </p>
                          )}
                          {(store.partner_name || store.partner_name_2) && (
                            <p className="text-xs text-muted-foreground">
                              Partners: {[store.partner_name, store.partner_name_2].filter(Boolean).join(', ')}
                            </p>
                          )}
                          {store.gstin_no && (
                            <p className="text-xs text-muted-foreground">
                              GSTIN: {store.gstin_no}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={store.verified ? "default" : "secondary"} className="text-xs">
                            {store.verified ? 'Verified' : 'Unverified'}
                          </Badge>
                          <Badge variant={store.active ? "default" : "secondary"} className="text-xs">
                            {store.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(store)}
                          className="flex-1"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStore(store)
                            setShowDeleteStoreDialog(true)
                          }}
                          className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Store Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStore} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Store Name *</Label>
                <Input
                  id="edit_name"
                  value={editStoreData.name}
                  onChange={(e) => handleEditInputChange('name', e.target.value)}
                  placeholder="Enter store name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_owner_name">Owner Name *</Label>
                <Input
                  id="edit_owner_name"
                  value={editStoreData.owner_name}
                  onChange={(e) => handleEditInputChange('owner_name', e.target.value)}
                  placeholder="Enter owner name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_owner_email">Owner Email *</Label>
                <Input
                  id="edit_owner_email"
                  type="email"
                  value={editStoreData.owner_email}
                  onChange={(e) => handleEditInputChange('owner_email', e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_owner_phone">Owner Phone</Label>
                <Input
                  id="edit_owner_phone"
                  type="tel"
                  value={editStoreData.owner_phone}
                  onChange={(e) => handleEditInputChange('owner_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_owner_pancard">PAN Card Number</Label>
                <Input
                  id="edit_owner_pancard"
                  value={editStoreData.owner_pancard}
                  onChange={(e) => handleEditInputChange('owner_pancard', e.target.value)}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_partner_name">Agent Name</Label>
                <Input
                  id="edit_partner_name"
                  value={editStoreData.partner_name}
                  onChange={(e) => handleEditInputChange('partner_name', e.target.value)}
                  placeholder="Enter partner name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_partner_name_2">Agent Number</Label>
              <Input
                id="edit_partner_name_2"
                value={editStoreData.partner_name_2}
                onChange={(e) => handleEditInputChange('partner_name_2', e.target.value)}
                placeholder="Enter second partner name"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_address">Address</Label>
              <Textarea
                id="edit_address"
                value={editStoreData.address}
                onChange={(e) => handleEditInputChange('address', e.target.value)}
                placeholder="Enter store address"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_gstin_no">GSTIN Number</Label>
              <Input
                id="edit_gstin_no"
                value={editStoreData.gstin_no}
                onChange={(e) => handleEditInputChange('gstin_no', e.target.value)}
                placeholder="Enter GSTIN number (optional)"
                maxLength={15}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={createLoading} className="flex-1">
                {createLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Store'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Query Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Query</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this query? This action cannot be undone and will also delete all associated documents.
            </p>
            
            {selectedQuery && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-800">{selectedQuery.reference_id}</p>
                <p className="text-sm text-red-600">{selectedQuery.other_store?.name}</p>
                <p className="text-sm text-red-600">Service: {selectedQuery.service?.name}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteQuery}
                disabled={loading === selectedQuery?.id}
                className="flex-1"
              >
                {loading === selectedQuery?.id ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Query'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Store Dialog */}
      <Dialog open={showDeleteStoreDialog} onOpenChange={setShowDeleteStoreDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this store? This action cannot be undone. The store cannot be deleted if it's being used in any queries.
            </p>
            
            {selectedStore && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-800">{selectedStore.name}</p>
                <p className="text-sm text-red-600">Owner: {selectedStore.owner_name}</p>
                <p className="text-sm text-red-600 break-all">Email: {selectedStore.owner_email}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Only show the deactivate (now "Delete") button */}
              <Button
                variant="destructive"
                onClick={handleDeactivateStore}
                disabled={loading === 'deactivate-store'}
                className="flex-1"
              >
                {loading === 'deactivate-store' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteStoreDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Force Delete Store Dialog */}
      <Dialog open={showForceDeleteDialog} onOpenChange={setShowForceDeleteDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="text-orange-500" size={20} />
              <span>Store In Use</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {deleteInfo?.error}
              </AlertDescription>
            </Alert>
            
            <p className="text-muted-foreground">
              This store is currently being used in existing queries. You have the following options:
            </p>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-foreground mb-1">Option 1: Deactivate Store</h4>
                <p className="text-sm text-muted-foreground">
                  Mark the store as inactive. Existing queries will remain unchanged, but new queries cannot use this store.
                </p>
                <Button
                  onClick={handleDeactivateStore}
                  disabled={loading === 'deactivate-store'}
                  className="mt-2"
                  variant="secondary"
                >
                  {loading === 'deactivate-store' ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Deactivating...
                    </>
                  ) : (
                    'Deactivate Store'
                  )}
                </Button>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-foreground mb-1">Option 2: Review Queries First</h4>
                <p className="text-sm text-muted-foreground">
                  Check which queries are using this store and handle them appropriately before deletion.
                </p>
              </div>

              {deleteInfo?.canForceDelete && (
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-1">Option 3: Force Delete</h4>
                  <p className="text-sm text-orange-700">
                    Delete the store anyway. This will remove the store reference from {deleteInfo.completedQueries} completed/rejected queries.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {deleteInfo?.canForceDelete && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteStore(true)}
                  disabled={loading === 'delete-store'}
                  className="w-full"
                >
                  {loading === 'delete-store' ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Force Deleting...
                    </>
                  ) : (
                    'Force Delete Store'
                  )}
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setShowForceDeleteDialog(false)} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}