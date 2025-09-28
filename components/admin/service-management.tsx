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
import { Switch } from '@/components/ui/switch'
import { FileText, Plus, Edit, Trash2, Loader2, IndianRupee, AlertTriangle } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { ApiClient } from '@/lib/api-client'

export function ServiceManagement() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleteInfo, setDeleteInfo] = useState<any>(null)
  const [newServiceData, setNewServiceData] = useState({
    name: '',
    description: '',
    base_fee: '',
    active: true
  })
  const [editServiceData, setEditServiceData] = useState({
    name: '',
    description: '',
    base_fee: '',
    active: true
  })

  const { data: services, isLoading } = useSWR(
    'admin-services',
    () => ApiClient.getServices(),
    {
      refreshInterval: 120000,
      dedupingInterval: 20000
    }
  )

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading('create')
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.createService({
        ...newServiceData,
        base_fee: parseFloat(newServiceData.base_fee) || 0
      })

      setSuccess('Service created successfully!')
      setShowCreateDialog(false)
      setNewServiceData({
        name: '',
        description: '',
        base_fee: '',
        active: true
      })
      
      mutate('admin-services')
      mutate('services')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return
    
    setLoading('edit')
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.updateService(selectedService.id, {
        ...editServiceData,
        base_fee: parseFloat(editServiceData.base_fee) || 0
      })

      setSuccess('Service updated successfully!')
      setShowEditDialog(false)
      setSelectedService(null)
      
      mutate('admin-services')
      mutate('services')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteService = async (force = false) => {
    if (!selectedService) return
    
    setLoading('delete')
    setError('')
    setSuccess('')
    setDeleteError('')

    try {
      await ApiClient.deleteService(selectedService.id)

      setSuccess('Service deleted successfully!')
      setShowDeleteDialog(false)
      setShowForceDeleteDialog(false)
      setSelectedService(null)
      setDeleteInfo(null)
      
      mutate('admin-services')
      mutate('services')
      
    } catch (err: any) {
      let errorData
      try {
        errorData = JSON.parse(err.message)
      } catch (parseError) {
        // If JSON parsing fails, treat as regular error message
        setError(err.message)
        return
      }
      
      if (errorData.canForceDelete !== undefined) {
        setDeleteError(errorData.error)
        setDeleteInfo(errorData)
        setShowDeleteDialog(false)
        setShowForceDeleteDialog(true)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleDeactivateService = async () => {
    if (!selectedService) return
    
    setLoading('deactivate')
    setError('')
    setSuccess('')

    try {
      await ApiClient.updateService(selectedService.id, {
        ...selectedService,
        active: false
      })

      setSuccess('Service deactivated successfully!')
      setShowForceDeleteDialog(false)
      setSelectedService(null)
      setDeleteInfo(null)
      
      mutate('admin-services')
      mutate('services')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const openEditDialog = (service: any) => {
    setSelectedService(service)
    setEditServiceData({
      name: service.name || '',
      description: service.description || '',
      base_fee: service.base_fee?.toString() || '',
      active: service.active ?? true
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (service: any) => {
    setSelectedService(service)
    setDeleteError('')
    setDeleteInfo(null)
    setShowDeleteDialog(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */} 
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Product Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage products offered on the platform
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus size={16} className="mr-2" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={newServiceData.name}
                  onChange={(e) => setNewServiceData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newServiceData.description}
                  onChange={(e) => setNewServiceData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="base_fee">Base Fee (₹) *</Label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="base_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newServiceData.base_fee}
                    onChange={(e) => setNewServiceData(prev => ({ ...prev, base_fee: e.target.value }))}
                    placeholder="0.00"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newServiceData.active}
                  onCheckedChange={(checked) => setNewServiceData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={loading === 'create'} className="flex-1">
                  {loading === 'create' ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>



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

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center space-x-2">
              <FileText size={20} />
              <span>All Products</span>
            </div>
            <Badge variant="secondary" className="w-fit">
              {Array.isArray(services) ? services.length : 0}
            </Badge>
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
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(services) || services.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service: any, index: number) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">
                        {service.name}
                      </p>
                      <Badge variant={service.active ? "default" : "secondary"} className="w-fit">
                        {service.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                        {service.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <IndianRupee size={12} className="mr-1" />
                        {service.base_fee || 0}
                      </span>
                      <span>Created: {new Date(service.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(service)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(service)}
                      className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditService} className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Product Name *</Label>
              <Input
                id="edit_name"
                value={editServiceData.name}
                onChange={(e) => setEditServiceData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={editServiceData.description}
                onChange={(e) => setEditServiceData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_base_fee">Base Fee (₹) *</Label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="edit_base_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editServiceData.base_fee}
                  onChange={(e) => setEditServiceData(prev => ({ ...prev, base_fee: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_active"
                checked={editServiceData.active}
                onCheckedChange={(checked) => setEditServiceData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="edit_active">Active</Label>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={loading === 'edit'} className="flex-1">
                {loading === 'edit' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this product? This action cannot be undone and may affect existing queries using this product.
            </p>
            
            {selectedService && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-800">{selectedService.name}</p>
                <p className="text-sm text-red-600">
                  Base Fee: ₹{selectedService.base_fee || 0}
                </p>
                {selectedService.description && (
                  <p className="text-sm text-red-600">{selectedService.description}</p>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDeleteService()}
                disabled={loading === 'delete'}
                className="flex-1"
              >
                {loading === 'delete' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Force Delete Dialog */}
      <Dialog open={showForceDeleteDialog} onOpenChange={setShowForceDeleteDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="text-orange-500" size={20} />
              <span>Product In Use</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {deleteError}
              </AlertDescription>
            </Alert>
            
            <p className="text-muted-foreground">
              This product is currently being used in existing queries. You have the following options:
            </p>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-foreground mb-1">Option 1: Deactivate Product</h4>
                <p className="text-sm text-muted-foreground">
                  Mark the product as inactive. Existing queries will remain unchanged, but new queries cannot use this product.
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-foreground mb-1">Option 2: Review Queries First</h4>
                <p className="text-sm text-muted-foreground">
                  Check which queries are using this product and handle them appropriately before deletion.
                </p>
              </div>

              {deleteInfo?.canForceDelete && (
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-1">Option 3: Force Delete</h4>
                  <p className="text-sm text-orange-700">
                    Delete the product anyway. This will remove the product reference from {deleteInfo.completedQueries} completed/rejected queries.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleDeactivateService}
                disabled={loading === 'deactivate'}
                className="w-full"
              >
                {loading === 'deactivate' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  'Deactivate Product'
                )}
              </Button>
              
              {deleteInfo?.canForceDelete && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteService(true)}
                  disabled={loading === 'delete'}
                  className="w-full"
                >
                  {loading === 'delete' ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Force Deleting...
                    </>
                  ) : (
                    'Force Delete Product'
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