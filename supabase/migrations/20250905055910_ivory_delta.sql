/*
# Stalk Finance Private Limited Database Schema

## Setup Instructions:
1. Copy and paste this entire file into your Supabase SQL Editor
2. Run the query to create all tables, policies, and seed data
3. Create auth users in Supabase Dashboard or via admin API:
   - Admin: admin@company.com / password123
   - Staff: staff@company.com / password123
4. Configure Storage bucket named 'documents' with public access disabled
5. Add SUPABASE_SERVICE_ROLE_KEY to your environment variables

## Security Notes:
- All tables have RLS enabled
- Service role key required for admin operations
- Signed URLs used for document access
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'staff', 'admin');
CREATE TYPE query_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'completed');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    base_fee DECIMAL(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    owner_phone TEXT,
    address TEXT,
    active BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ
);

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id),
    service_id UUID REFERENCES services(id),
    store_id UUID REFERENCES stores(id),
    other_store JSONB, -- For pending store approvals
    amount DECIMAL(10,2),
    timeline TEXT,
    purpose TEXT,
    description TEXT,
    status query_status DEFAULT 'pending',
    staff_assigned UUID REFERENCES profiles(id),
    admin_approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    compressed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table for admin/staff comments
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    internal BOOLEAN DEFAULT false, -- Internal notes not visible to users
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_queries_user_id ON queries(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_documents_query_id ON documents(query_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Generate reference ID function
CREATE OR REPLACE FUNCTION generate_reference_id()
RETURNS TEXT AS $$
DECLARE
    ref_id TEXT;
    counter INTEGER := 1;
    base_id TEXT;
BEGIN
    base_id := 'FQ' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(EXTRACT(epoch FROM NOW())::TEXT, 6, '0');
    ref_id := base_id;
    
    WHILE EXISTS (SELECT 1 FROM queries WHERE reference_id = ref_id) LOOP
        ref_id := base_id || '-' || LPAD(counter::TEXT, 3, '0');
        counter := counter + 1;
    END LOOP;
    
    RETURN ref_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference_id
CREATE OR REPLACE FUNCTION set_reference_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reference_id := generate_reference_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_reference_id
    BEFORE INSERT ON queries
    FOR EACH ROW
    EXECUTE FUNCTION set_reference_id();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_queries_updated_at
    BEFORE UPDATE ON queries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Helper function to check if user is staff or admin
CREATE OR REPLACE FUNCTION is_staff_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Staff and admin can read all profiles" ON profiles
    FOR SELECT USING (is_staff_or_admin(auth.uid()));

-- Services policies (public read)
CREATE POLICY "Anyone can read active services" ON services
    FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage services" ON services
    FOR ALL USING (is_admin(auth.uid()));

-- Stores policies
CREATE POLICY "Users can read active stores" ON stores
    FOR SELECT USING (active = true AND verified = true);

CREATE POLICY "Staff and admin can read all stores" ON stores
    FOR SELECT USING (is_staff_or_admin(auth.uid()));

CREATE POLICY "Admin can manage stores" ON stores
    FOR ALL USING (is_admin(auth.uid()));

-- Queries policies
CREATE POLICY "Users can read own queries" ON queries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create queries" ON queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queries" ON queries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can read assigned queries" ON queries
    FOR SELECT USING (
        is_staff_or_admin(auth.uid()) OR 
        auth.uid() = staff_assigned
    );

CREATE POLICY "Admin can manage all queries" ON queries
    FOR ALL USING (is_admin(auth.uid()));

-- Documents policies
CREATE POLICY "Users can read own documents" ON documents
    FOR SELECT USING (
        auth.uid() = uploaded_by OR
        auth.uid() = (SELECT user_id FROM queries WHERE id = query_id)
    );

CREATE POLICY "Users can upload documents to own queries" ON documents
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by AND
        auth.uid() = (SELECT user_id FROM queries WHERE id = query_id)
    );

CREATE POLICY "Staff and admin can read all documents" ON documents
    FOR SELECT USING (is_staff_or_admin(auth.uid()));

-- Notes policies
CREATE POLICY "Users can read non-internal notes on own queries" ON notes
    FOR SELECT USING (
        (auth.uid() = (SELECT user_id FROM queries WHERE id = query_id) AND internal = false) OR
        is_staff_or_admin(auth.uid())
    );

CREATE POLICY "Staff and admin can create notes" ON notes
    FOR INSERT WITH CHECK (is_staff_or_admin(auth.uid()));

-- Seed data

-- Insert sample services
INSERT INTO services (name, description, base_fee) VALUES
    ('Business Registration', 'Complete business registration and licensing service', 500.00),
    ('Tax Consultation', 'Professional tax advice and planning services', 200.00),
    ('Financial Audit', 'Comprehensive financial audit and compliance review', 1500.00),
    ('Bookkeeping Services', 'Monthly bookkeeping and financial record maintenance', 300.00),
    ('Legal Documentation', 'Legal document preparation and review services', 400.00),
    ('Investment Advisory', 'Investment planning and portfolio management consultation', 800.00)
ON CONFLICT DO NOTHING;

-- Insert sample stores
INSERT INTO stores (name, owner_name, owner_email, owner_phone, address, active, verified) VALUES
    ('Downtown Business Center', 'John Smith', 'john@downtown-bc.com', '+1-555-0101', '123 Main St, Downtown', true, true),
    ('Westside Financial Hub', 'Sarah Johnson', 'sarah@westside-fh.com', '+1-555-0102', '456 West Ave, Westside', true, true),
    ('Central Plaza Services', 'Mike Chen', 'mike@central-plaza.com', '+1-555-0103', '789 Central Blvd, Midtown', true, true),
    ('Northgate Business Park', 'Lisa Brown', 'lisa@northgate-bp.com', '+1-555-0104', '321 North Gate Dr, Northside', true, true),
    ('Eastend Corporate Center', 'David Wilson', 'david@eastend-cc.com', '+1-555-0105', '654 East End Rd, Eastside', true, true)
ON CONFLICT DO NOTHING;

-- Note: Admin and Staff profiles must be created after auth.users exist
-- Insert seed profiles (admin and staff) - these IDs should match actual auth.users
-- You'll need to create the auth.users first, then update these UUIDs

-- Example admin profile (replace UUID with actual auth.users id)
-- INSERT INTO profiles (id, email, full_name, role) VALUES
--     ('admin-uuid-here', 'admin@company.com', 'System Administrator', 'admin'),
--     ('staff-uuid-here', 'staff@company.com', 'Staff Member', 'staff')
-- ON CONFLICT (id) DO NOTHING;

-- Sample queries for testing (uncomment after creating users)
-- INSERT INTO queries (user_id, service_id, store_id, amount, timeline, purpose, description, status) VALUES
--     ('user-uuid-here', (SELECT id FROM services WHERE name = 'Business Registration' LIMIT 1), (SELECT id FROM stores WHERE name = 'Downtown Business Center' LIMIT 1), 500.00, '2 weeks', 'New business setup', 'Need help registering a new LLC business', 'pending')
-- ON CONFLICT DO NOTHING;

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;