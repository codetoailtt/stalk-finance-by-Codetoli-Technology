export type UserRole = 'user' | 'staff' | 'admin'
export type QueryStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed'

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description?: string
  base_fee: number
  active: boolean
  created_at: string
}

export interface Store {
  id: string
  name: string
  owner_name: string
  owner_email: string
  owner_phone?: string
  address?: string
  active: boolean
  verified: boolean
  created_at: string
  approved_by?: string
  approved_at?: string
}

export interface Query {
  id: string
  reference_id: string
  user_id: string
  service_id?: string
  store_id?: string
  other_store?: {
    name: string
    owner_email: string
    owner_phone: string
  }
  amount?: number
  tenure_months?: number
  timeline?: string
  purpose?: string
  description?: string
  status: QueryStatus
  staff_assigned?: string
  admin_approved_by?: string
  service_fee_paid?: boolean
  service_fee_paid_at?: string
  emi_started?: boolean
  emi_started_at?: string
  emi_date?: number
  emi_percent?: number
  emi_payments?: any
  principal_amount?: number
  penalty_amount?: number
  penalty_started_at?: string
  penalty_waived?: boolean
  penalty_waived_by?: string
  terms_accepted?: boolean
  terms_accepted_at?: string
  created_at: string
  updated_at: string
  approved_at?: string
  completed_at?: string
  
  // Joined data
  service?: Service
  store?: Store
  user?: Profile
}

export interface Document {
  id: string
  query_id: string
  uploaded_by: string
  filename: string
  blocked?: boolean
  blocked_at?: string
  blocked_by?: string
  original_filename: string
  storage_path: string
  mime_type: string
  file_size: number
  compressed: boolean
  created_at: string
}

export interface Note {
  id: string
  query_id: string
  created_by: string
  content: string
  internal: boolean
  created_at: string
  
  // Joined data
  created_by_profile?: Profile
}