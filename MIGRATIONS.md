# Vitamin F3 - Database Migrations

Run these SQL statements in Supabase SQL Editor in order.

---

## 1. Create bookings table (if not exists)

```sql
-- Bookings table for session reservations
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
    booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(session_id, client_id)
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = client_id);

-- Policy: Users can create their own bookings
CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Policy: Users can update their own bookings (cancel)
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = client_id);

-- Policy: Admin can view all bookings
CREATE POLICY "Admin can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy: Admin can update all bookings
CREATE POLICY "Admin can update all bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

---

## 2. Create payment_submissions table (if not exists)

```sql
-- Payment submissions table
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

-- Enable RLS
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments" ON payment_submissions
    FOR SELECT USING (auth.uid() = client_id);

-- Policy: Users can create their own payments
CREATE POLICY "Users can create own payments" ON payment_submissions
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Policy: Admin can view all payments
CREATE POLICY "Admin can view all payments" ON payment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy: Admin can update all payments
CREATE POLICY "Admin can update all payments" ON payment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

---

## 3. Create leads table (if not exists)

```sql
-- Leads table for users without communities
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('personal_training', 'new_community_class')),
    preferred_time TEXT,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own leads
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = client_id);

-- Policy: Users can create their own leads
CREATE POLICY "Users can create own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Policy: Admin can view all leads
CREATE POLICY "Admin can view all leads" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

---

## 4. Storage bucket for payment proofs

```sql
-- Create storage bucket (run in Supabase Dashboard > Storage > New bucket)
-- Name: payment-proofs
-- Public: false (private)

-- Storage policies (run in SQL Editor)
-- Policy: Allow users to upload their own payment proofs
INSERT INTO storage.policies (bucket_id, name, definition)
SELECT 
    'payment-proofs',
    'Users can upload own payment proofs',
    jsonb_build_object(
        'operation', 'INSERT',
        'check', format('(bucket_id = ''payment-proofs'' AND (storage.foldername(name))[1] = ''payments'' AND (storage.foldername(name))[2] = auth.uid()::text)')
    )
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'payment-proofs' AND name = 'Users can upload own payment proofs'
);

-- Alternative: Run these in Storage > Policies in Dashboard:
-- 1. INSERT: Allow authenticated users to upload to payments/{uid}/*
--    Expression: bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[2]
-- 2. SELECT for admin: Allow admin to read all files
```

---

## 5. Index for better booking query performance

```sql
-- Index for faster booking counts
CREATE INDEX IF NOT EXISTS idx_bookings_session_status 
ON bookings(session_id, status);

-- Index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_client_status 
ON payment_submissions(client_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_status_created 
ON payment_submissions(status, created_at DESC);
```

---

## Notes

1. **Storage Bucket**: Create `payment-proofs` bucket manually in Supabase Dashboard > Storage > New bucket (set as private/not public).

2. **Storage Policies**: After creating the bucket, add these policies in Dashboard > Storage > payment-proofs > Policies:
   - INSERT: `(bucket_id = 'payment-proofs') AND ((storage.foldername(name))[1] = 'payments') AND ((storage.foldername(name))[2] = auth.uid()::text)`
   - SELECT (for admin): Check user is admin via profiles table

3. **Admin User**: Make sure at least one user has `role = 'admin'` in the profiles table.
