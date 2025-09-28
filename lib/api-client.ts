// Enhanced API client with better authentication handling
import { supabase } from './supabase'

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10000 // 10 seconds for faster updates

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

export class ApiClient {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = getCachedData(endpoint)
      if (cached) {
        return cached
      }
    }

    // Get current session for authentication
    let session = null
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session = currentSession
    } catch (error) {
      console.error('Session error:', error)
    }
    
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    }
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      throw new Error(error.error || `Request failed with status ${response.status}`)
    }

    const result = await response.json()
    
    // Cache GET requests
    if (!options.method || options.method === 'GET') {
      setCachedData(endpoint, result)
    }
    
    return result
  }

  // Clear cache for specific endpoints
  static clearCache(pattern?: string) {
    if (pattern) {
      Array.from(cache.keys()).forEach((key) => {
        if (key.includes(pattern)) {
          cache.delete(key)
        }
      })
    } else {
      cache.clear()
    }
  }

  // Auth methods
  static async signIn(email: string, password: string) {
    return this.makeRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  static async signUp(email: string, password: string, fullName: string) {
    return this.makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    })
  }

  static async signOut() {
    return this.makeRequest('/api/auth/signout', {
      method: 'POST',
    })
  }

  static async getCurrentUser() {
    return this.makeRequest('/api/auth/user')
  }

  // Data fetching methods
  static async getQueries(page = 1, limit = 1000) {
    return this.makeRequest(`/api/queries?page=${page}&limit=${limit}`)
  }

  static async getQuery(id: string) {
    return this.makeRequest(`/api/queries/${id}`)
  }

  static async createQuery(data: any) {
    this.clearCache('queries')
    return this.makeRequest('/api/queries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async updateQuery(id: string, data: any) {
    this.clearCache('queries')
    this.clearCache(`query-${id}`)
    return this.makeRequest(`/api/queries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async deleteQuery(id: string) {
    this.clearCache('queries')
    this.clearCache(`query-${id}`)
    return this.makeRequest(`/api/queries/${id}`, {
      method: 'DELETE',
    })
  }

  static async getStores() {
    return this.makeRequest('/api/stores')
  }

  static async getServices() {
    return this.makeRequest('/api/services')
  }

  static async createService(data: any) {
    this.clearCache('services')
    this.clearCache('admin-services')
    return this.makeRequest('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async updateService(id: string, data: any) {
    this.clearCache('services')
    this.clearCache('admin-services')
    return this.makeRequest(`/api/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async deleteService(id: string) {
    this.clearCache('services')
    this.clearCache('admin-services')
    return this.makeRequest(`/api/services/${id}`, {
      method: 'DELETE',
    })
  }

  static async downloadDocument(documentId: string) {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession()
    
    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`/api/documents/${documentId}/download`, {
      method: 'GET',
      headers,
      credentials: 'include', // Include cookies for authentication
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Download failed' }))
      throw new Error(error.error || 'Download failed')
    }
    
    return response
  }

  static async getUsers() {
    return this.makeRequest('/api/admin/users')
  }

  static async updateUser(id: string, data: any) {
    this.clearCache('users')
    return this.makeRequest(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async blockUser(id: string, blocked: boolean) {
    this.clearCache('users')
    return this.makeRequest(`/api/admin/users/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ blocked }),
    })
  }

  static async markServiceFeePaid(queryId: string, paid: boolean) {
    this.clearCache('queries')
    this.clearCache(`query-${queryId}`)
    return this.makeRequest(`/api/queries/${queryId}/service-fee`, {
      method: 'PATCH',
      body: JSON.stringify({ paid }),
    })
  }

  static async startEMI(queryId: string, emiDate: number, emiPercent: number, tenureMonths: number) {
    this.clearCache('queries')
    this.clearCache(`query-${queryId}`)
    return this.makeRequest(`/api/queries/${queryId}/start-emi`, {
      method: 'POST',
      body: JSON.stringify({ emi_date: emiDate, emi_percent: emiPercent, tenure_months: tenureMonths }),
    })
  }

  static async updateEMISettings(queryId: string, emiDate: number, emiPercent: number, tenureMonths: number) {
    this.clearCache('queries')
    this.clearCache(`query-${queryId}`)
    return this.makeRequest(`/api/queries/${queryId}/emi-settings`, {
      method: 'PATCH',
      body: JSON.stringify({ emi_date: emiDate, emi_percent: emiPercent, tenure_months: tenureMonths }),
    })
  }

  static async markEMIPaid(queryId: string, month: string, amount: number) {
    this.clearCache('queries')
    this.clearCache(`query-${queryId}`)
    return this.makeRequest(`/api/queries/${queryId}/emi-payment`, {
      method: 'POST',
      body: JSON.stringify({ month, amount }),
    })
  }

  static async waivePenalty(queryId: string) {
    this.clearCache('queries')
    this.clearCache(`query-${queryId}`)
    return this.makeRequest(`/api/queries/${queryId}/waive-penalty`, {
      method: 'POST',
    })
  }

  static async updatePenalty(queryId: string) {
    // Prevent unnecessary requests if EMI is already complete
    const query = await this.getQuery(queryId)
    // Use isEMIComplete from utils
    // Dynamically import to avoid circular dependency
    const { isEMIComplete } = await import('./utils')
    if (isEMIComplete(query)) {
      // No need to update penalty if EMI is complete
      return { success: true, skipped: true }
    }
    this.clearCache('queries')
    this.clearCache(`query-${queryId}`)
    return this.makeRequest(`/api/queries/${queryId}/update-penalty`, {
      method: 'POST',
    })
  }



  static async getUserQueries(userId: string) {
    return this.makeRequest(`/api/admin/users/${userId}/queries`)
  }

  static async deleteUser(id: string) {
    this.clearCache('users')
    return this.makeRequest(`/api/admin/users/${id}`, {
      method: 'DELETE',
    })
  }

  static async getOtherStores() {
    return this.makeRequest('/api/admin/other-stores')
  }

  static async approveStore(queryId: string, action: 'approve' | 'reject') {
    this.clearCache('other-stores')
    this.clearCache('stores')
    this.clearCache('queries')
    
    const response = await fetch('/api/admin/stores/approve', {
      method: 'POST',
      body: JSON.stringify({ query_id: queryId, action }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      throw new Error(error.error || `Request failed with status ${response.status}`)
    }

    return response.json()
  }

  static async createStore(data: any) {
    this.clearCache('stores')
    return this.makeRequest('/api/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async updateStore(id: string, data: any) {
    this.clearCache('stores')
    return this.makeRequest(`/api/stores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async deleteStore(id: string) {
    this.clearCache('stores')
    return this.makeRequest(`/api/stores/${id}`, {
      method: 'DELETE',
    })
  }

  static async uploadFile(file: File, queryId: string) {
    // Get current session for file upload
    const { data: { session } } = await supabase.auth.getSession()
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('query_id', queryId)

    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch('/api/upload-compress', {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || 'Upload failed')
    }

    return response.json()
  }
}