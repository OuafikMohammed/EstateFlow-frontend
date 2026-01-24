# Quick Setup for RLS Policies

## 🚨 You MUST Run This SQL in Supabase

Go to: https://app.supabase.com → Your Project → SQL Editor

**Copy and paste this ENTIRE block:**

```sql
-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Users can view their company properties
DROP POLICY IF EXISTS "Users can view their company properties" ON properties;
CREATE POLICY "Users can view their company properties"
ON properties FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy 2: INSERT - Users can create properties for their company
DROP POLICY IF EXISTS "Users can create properties for their company" ON properties;
CREATE POLICY "Users can create properties for their company"
ON properties FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy 3: UPDATE - Users can update their company properties
DROP POLICY IF EXISTS "Users can update their company properties" ON properties;
CREATE POLICY "Users can update their company properties"
ON properties FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy 4: DELETE - Users can delete their company properties
DROP POLICY IF EXISTS "Users can delete their company properties" ON properties;
CREATE POLICY "Users can delete their company properties"
ON properties FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);
```

**Steps:**
1. Open https://app.supabase.com
2. Select **EstateFlow** project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste the SQL above
6. Click **Run** (⚡ button)
7. Wait for success message
8. ✅ Done!

---

## For Storage Bucket

Also create the bucket:

```sql
-- You can run this in SQL Editor too, but easier via Dashboard
-- Go to: Storage → Create New Bucket → Name: "properties" → Uncheck Private → Create
```

Or go to **Storage** tab and manually create `properties` bucket with **public** access.

---

## Quick Verification

After running SQL, go to your **SQL Editor** and run:

```sql
SELECT * FROM pg_policies WHERE tablename = 'properties';
```

You should see 4 policies listed.

---

That's it! Then try uploading again.
