-- ============================================
-- VITAMIN F3 - COMPLETE DATABASE SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- 1. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
    booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(session_id, client_id)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can update all bookings" ON bookings;

CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Admin can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

CREATE POLICY "Admin can update all bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

-- 2. PAYMENT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    upi_ref TEXT,
    session_id UUID REFERENCES class_sessions(id) ON DELETE SET NULL,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    screenshot_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON payment_submissions;
DROP POLICY IF EXISTS "Users can create own payments" ON payment_submissions;
DROP POLICY IF EXISTS "Admin can view all payments" ON payment_submissions;
DROP POLICY IF EXISTS "Admin can update all payments" ON payment_submissions;

CREATE POLICY "Users can view own payments" ON payment_submissions
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own payments" ON payment_submissions
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admin can view all payments" ON payment_submissions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

CREATE POLICY "Admin can update all payments" ON payment_submissions
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

-- 3. LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('personal_training', 'new_community_class')),
    preferred_time TEXT,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can create own leads" ON leads;
DROP POLICY IF EXISTS "Admin can view all leads" ON leads;

CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admin can view all leads" ON leads
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_session_status ON bookings(session_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_status ON payment_submissions(client_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payment_submissions(status, created_at DESC);

-- 5. DONE!
-- ============================================
-- Now do these MANUAL steps in Supabase Dashboard:
-- 
-- A) Create Storage Bucket:
--    Go to Storage > New bucket > Name: "payment-proofs" > Make it PRIVATE (not public)
--
-- B) Add Storage Policy for uploads:
--    Go to Storage > payment-proofs > Policies > New Policy
--    - Name: "Users can upload own files"
--    - Allowed operation: INSERT
--    - Policy: (bucket_id = 'payment-proofs') AND ((storage.foldername(name))[1] = 'payments') AND ((storage.foldername(name))[2] = (auth.uid())::text)
--
-- C) Create Admin User:
--    Sign up through the app, then run this SQL (replace YOUR_USER_ID):
--    UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';

SELECT 'Migration completed successfully!' as status;
