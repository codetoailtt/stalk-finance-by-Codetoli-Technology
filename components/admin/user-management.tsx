'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, Search, UserCheck, Shield, User, Eye, Edit, Trash2, Loader2 } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { isEMIDueThisMonth, isEMIComplete } from '@/lib/utils'

import { ApiClient } from '@/lib/api-client'

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userQueries, setUserQueries] = useState<any[]>([])
  const [loadingUserQueries, setLoadingUserQueries] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editData, setEditData] = useState({
    full_name: '',
    role: 'user'
  })
  
  const { data: queries, isLoading } = useSWR('queries', () => ApiClient.getQueries())
  const { data: users, isLoading: usersLoading } = useSWR(
    'users', 
    () => ApiClient.getUsers(),
    {
      refreshInterval: 120000,
      dedupingInterval: 20000
    }
  )

  // Extract unique users from queries (in a real app, you'd have a dedicated users endpoint)
  const allUsers = Array.isArray(users) ? users : 
    Array.isArray(queries) ? 
    queries.reduce((acc: any[], query: any) => {
      if (query.user && !acc.find(u => u.id === query.user.id)) {
        acc.push({
          ...query.user,
          queryCount: queries.filter(q => q.user_id === query.user.id).length,
          lastActivity: new Date(Math.max(...queries
            .filter(q => q.user_id === query.user.id)
            .map(q => new Date(q.created_at).getTime())
          ))
        })
      }
      return acc
    }, []) : []

  const filteredUsers = allUsers.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    setLoading('update')
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.updateUser(selectedUser.id, editData)

      setSuccess('User updated successfully!')
      setShowEditDialog(false)
      
      // Refresh data
      mutate('users')
      mutate('queries')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    setLoading('delete')
    setError('')
    setSuccess('')

    try {
      const result = await ApiClient.deleteUser(selectedUser.id)

      setSuccess('User deleted successfully!')
      setShowDeleteDialog(false)
      setSelectedUser(null)
      
      // Refresh data
      mutate('users')
      mutate('queries')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleBlockUser = async (blocked: boolean) => {
    if (!selectedUser) return
    
    setLoading('block')
    setError('')
    setSuccess('')

    try {
      await ApiClient.blockUser(selectedUser.id, blocked)
      setSuccess(`User ${blocked ? 'blocked' : 'unblocked'} successfully!`)
      
      // Update local state
      setSelectedUser((prev: any) => ({ ...prev, blocked }))
      
      // Refresh data
      mutate('users')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const loadUserQueries = async (userId: string) => {
    setLoadingUserQueries(true)
    try {
      const queries = await ApiClient.getUserQueries(userId)
      setUserQueries(queries)
    } catch (err: any) {
      setError(err.message)
      setUserQueries([])
    } finally {
      setLoadingUserQueries(false)
    }
  }

  const openUserDialog = (user: any) => {
    setSelectedUser(user)
    loadUserQueries(user.id)
    setShowUserDialog(true)
  }

  const openEditDialog = (user: any) => {
    setSelectedUser(user)
    setEditData({
      full_name: user.full_name || '',
      role: user.role || 'user'
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} className="text-red-600" />
      case 'staff':
        return <UserCheck size={16} className="text-blue-600" />
      default:
        return <User size={16} className="text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>
      case 'staff':
        return <Badge className="bg-blue-100 text-blue-800">Staff</Badge>
      default:
        return <Badge variant="secondary">User</Badge>
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
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
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
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{isLoading || usersLoading ? '...' : allUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <Users size={20} />
            <span>All Users</span>
            <Badge variant="secondary">{filteredUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || usersLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {filteredUsers.map((user: any, index: number) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors w-full"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-foreground truncate">
                        {user.full_name || 'Unnamed User'}
                      </p>
                      {getRoleBadge(user.role)}
                      {user.blocked && (
                        <Badge variant="destructive" className="text-xs">Blocked</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>{user.queryCount || 0} queries</span>
                      {user.lastActivity && (
                        <span>Last active: {user.lastActivity.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openUserDialog(user)}
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
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

      {/* User Detail Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {getRoleIcon(selectedUser.role)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.full_name || 'Unnamed User'}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {selectedUser.blocked && (
                      <Badge variant="destructive" className="text-xs">Blocked</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.role?.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Queries</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.queryCount || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className={`text-sm ${selectedUser.blocked ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedUser.blocked ? 'Blocked' : 'Active'}
                  </p>
                </div>
                {selectedUser.blocked && selectedUser.blocked_at && (
                  <div>
                    <Label className="text-sm font-medium">Blocked At</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedUser.blocked_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedUser.lastActivity && (
                <div>
                  <Label className="text-sm font-medium">Last Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.lastActivity.toLocaleString()}
                  </p>
                </div>
              )}

              {/* User Queries */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">User Queries ({userQueries.length})</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={selectedUser.blocked ? "default" : "destructive"}
                      size="sm"
                      onClick={() => handleBlockUser(!selectedUser.blocked)}
                      disabled={loading === 'block'}
                    >
                      {loading === 'block' ? (
                        <>
                          <Loader2 size={14} className="mr-1 animate-spin" />
                          {selectedUser.blocked ? 'Unblocking...' : 'Blocking...'}
                        </>
                      ) : (
                        selectedUser.blocked ? 'Unblock User' : 'Block User'
                      )}
                    </Button>
                  </div>
                </div>
                
                {loadingUserQueries ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse p-3 border rounded-lg">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userQueries.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No queries found for this user
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {userQueries.map((query: any) => (
                      <div key={query.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{query.reference_id}</span>
                            {getStatusBadge(query.status)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(query.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span>Product: {query.service?.name}</span>
                            {query.other_service && (
                              <span className="text-xs text-orange-600">Custom: {query.other_service}</span>
                            )}
                          </div>
                          {query.amount && <p>Amount: ₹{query.amount}</p>}
                          {query.tenure_months && <p>Tenure: {query.tenure_months} months</p>}
                          {query.status === 'approved' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                              <span className={query.service_fee_paid ? 'text-green-600' : 'text-red-600'}>
                                Service Fee: {query.service_fee_paid ? 'Paid' : 'Unpaid'}
                              </span>
                              {query.emi_started && (
                                <div className="space-y-1">
                                  <span className="text-blue-600">
                                    EMI: {query.emi_percent}% for {query.tenure_months} months
                                  </span>
                                  <span className={
                                    isEMIComplete(query) ? 'text-green-600' :
                                    isEMIDueThisMonth(query.emi_date, query.emi_payments) ? 'text-red-600' : 'text-green-600'
                                  }>
                                    Status: {
                                      isEMIComplete(query) ? 'EMI Complete' :
                                      isEMIDueThisMonth(query.emi_date, query.emi_payments) ? 'Due This Month' : 'Up to Date'
                                    }
                                  </span>
                                </div>
                              )}
                              {query.penalty_amount > 0 && (
                                <span className="text-red-600 font-medium">
                                  Penalty: ₹{query.penalty_amount}
                                </span>
                              )}
                              {query.penalty_waived && (
                                <span className="text-green-600">
                                  Penalty Waived
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editData.full_name}
                onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={editData.role} onValueChange={(value) => setEditData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleUpdateUser}
                disabled={loading === 'update'}
              >
                {loading === 'update' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this user? This action cannot be undone and will also delete all associated queries and documents.
            </p>
            
            {selectedUser && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-800">{selectedUser.full_name || 'Unnamed User'}</p>
                <p className="text-sm text-red-600">{selectedUser.email}</p>
                <p className="text-sm text-red-600">{selectedUser.queryCount || 0} queries will be deleted</p>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={loading === 'delete'}
              >
                {loading === 'delete' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}