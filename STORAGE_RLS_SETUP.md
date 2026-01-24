# EstateFlow - Storage & RLS Setup Guide

## Issues & Solutions

### Issue 1: Bucket Not Found
**Error**: `Bucket not found`

**Solution**: Create the `properties` storage bucket

#### Quick Setup (Admin API)
```bash
# Make a POST request to initialize storage
curl -X POST http://localhost:3000/api/admin/setup
```

This will automatically create the `properties` bucket.

#### Manual Setup (Supabase Dashboard)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your EstateFlow project
3. Click **Storage** in the sidebar
4. Click **Create a new bucket**
5. Enter: `properties`
6. Uncheck **"Private bucket"** (make it public)
7. Click **Create bucket**

---

### Issue 2: Row-Level Security Policy Violation
**Error**: `new row violates row-level security policy`

**Why it happens**: The `properties` table has RLS enabled but no policy allows users to insert data.

#### Solution: Create RLS Policies

Go to **Supabase Dashboard → SQL Editor** and run this:

```sql
-- Enable RLS on properties table (if not already enabled)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view properties from their company
CREATE POLICY "Users can view their company properties"
ON properties FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy 2: Users can insert properties for their company
CREATE POLICY "Users can create properties for their company"
ON properties FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy 3: Users can update their company properties
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

-- Policy 4: Users can delete their company properties
CREATE POLICY "Users can delete their company properties"
ON properties FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);
```

#### Verify Policies
After running the SQL:
1. Go to **SQL Editor → RLS Policies**
2. Select **properties** table
3. You should see 4 policies for SELECT, INSERT, UPDATE, DELETE

---

## Complete Setup Checklist

- [ ] Environment variables set (`.env.local` exists)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

- [ ] Storage bucket created
  - [ ] `properties` bucket exists
  - [ ] Set to **public**

- [ ] RLS policies configured
  - [ ] Properties table has RLS **enabled**
  - [ ] SELECT policy created
  - [ ] INSERT policy created
  - [ ] UPDATE policy created
  - [ ] DELETE policy created

- [ ] Database schema set up
  - [ ] `companies` table exists
  - [ ] `profiles` table exists
  - [ ] `properties` table exists
  - [ ] All tables have `company_id` foreign key

- [ ] Authentication working
  - [ ] User can sign up/login
  - [ ] User profile created with `company_id`
  - [ ] User belongs to company

---

## Testing

### 1. Test Storage Bucket
```bash
curl -X POST http://localhost:3000/api/admin/setup
```

Expected response:
```json
{
  "success": true,
  "results": {
    "properties_bucket": {
      "status": "success",
      "message": "Properties bucket created"
    }
  }
}
```

### 2. Test Upload
1. Go to Add New Property page
2. Go to Photos step
3. Upload a test image
4. Check browser console for success message

### 3. Test Property Creation
1. Fill in property details
2. Upload photos
3. Preview and publish
4. Should create property without RLS errors

---

## Troubleshooting

### Problem: Still getting "Bucket not found"
- [ ] Check environment variables are loaded
- [ ] Run admin setup: `curl -X POST http://localhost:3000/api/admin/setup`
- [ ] Verify bucket exists in Supabase Dashboard

### Problem: Still getting "row violates row-level security policy"
- [ ] Run the SQL policies above in Supabase SQL Editor
- [ ] Make sure you're authenticated before creating property
- [ ] Check user profile has `company_id` set
- [ ] Verify policies in RLS Policies section

### Problem: Image upload shows error in browser
- [ ] Open Developer Console (F12)
- [ ] Check Console tab for error messages
- [ ] Look for specific error about bucket or policy

---

## Next Steps

After setup is complete:
1. ✅ Test uploading a property
2. ✅ Test creating a property with photos
3. ✅ Test viewing properties list
4. ✅ Test deleting a property

Then you can deploy to production!
