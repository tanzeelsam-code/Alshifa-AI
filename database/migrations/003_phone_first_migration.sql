-- Migration: Phone-First Authentication Schema Changes
-- Target: public schema in Supabase
-- 
-- Changes:
-- 1. Make 'mobile' column NOT NULL and UNIQUE (primary identifier)
-- 2. Make 'date_of_birth' column NOT NULL (required at registration)
-- 3. Make 'email' column NULLABLE with partial UNIQUE index
-- 
-- WARNING: Run this migration carefully. Existing users without mobile/DOB will need manual update first.

-- Step 1: First, update any NULL mobile values with placeholder (for existing data)
-- You may want to do this manually for real data
-- UPDATE public.users SET mobile = CONCAT('+00', id::text) WHERE mobile IS NULL;
-- UPDATE public.users SET date_of_birth = '1900-01-01' WHERE date_of_birth IS NULL;

-- Step 2: Alter mobile column to NOT NULL (only after ensuring no NULLs exist)
-- ALTER TABLE public.users ALTER COLUMN mobile SET NOT NULL;

-- Step 3: Add UNIQUE constraint on mobile
-- Note: This may fail if there are duplicate mobile numbers
-- ALTER TABLE public.users ADD CONSTRAINT users_mobile_unique UNIQUE (mobile);

-- Step 4: Alter date_of_birth to NOT NULL (only after ensuring no NULLs exist)
-- ALTER TABLE public.users ALTER COLUMN date_of_birth SET NOT NULL;

-- Step 5: Allow email to be NULL (already nullable, but make explicit)
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Step 6: Create partial unique index on email (unique where not null)
-- This allows multiple NULLs but requires unique non-null values
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_partial 
ON public.users (email) 
WHERE email IS NOT NULL;

-- Step 7: Update RLS policies if needed (optional, depends on your security model)
-- Uncomment if you want to add phone-based policies
-- 
-- CREATE POLICY "Allow read by phone" 
-- ON public.users FOR SELECT 
-- USING (mobile = current_setting('request.jwt.claims')::json->>'phone');

-- IMPORTANT: The above ALTER statements for NOT NULL are commented out.
-- Before running them:
-- 1. Ensure all existing users have mobile and date_of_birth values
-- 2. Test in a staging environment first
-- 3. Have a rollback plan

-- To make fields NOT NULL after data cleanup, run:
-- ALTER TABLE public.users ALTER COLUMN mobile SET NOT NULL;
-- ALTER TABLE public.users ALTER COLUMN date_of_birth SET NOT NULL;
-- ALTER TABLE public.users ADD CONSTRAINT users_mobile_unique UNIQUE (mobile);
