# Supabase Storage Setup Guide - Property Images

## Step-by-Step Instructions for Dashboard Setup

### Step 1: Navigate to Storage in Supabase Dashboard
1. Go to your Supabase project: https://supabase.com/dashboard/projects/uozchnrhxeiyywyvbyxb
2. In the left sidebar, click **Storage**
3. You should see the main Storage page with any existing buckets

### Step 2: Create New Bucket
1. Click the **Create a new bucket** button (usually top right)
2. In the modal that appears:
   - **Bucket name**: `property-images`
   - **Make it public**: ✅ CHECK THIS BOX (important for public image URLs)
   - Click **Create bucket**

### Step 3: Verify Bucket Creation
- You should see "property-images" listed with a 🔒 or 🌐 icon
- If 🌐 shows, it's public ✅
- If 🔒 shows, you need to make it public (see next step)

### Step 4: Make Bucket Public (if needed)
1. Click on the **property-images** bucket
2. Click the **Settings** tab (top right)
3. Look for **Visibility** or **Public** toggle
4. Enable **Public access**
5. Click **Save** or **Confirm**

### Step 5: Configure Storage Policies
1. Click on the **property-images** bucket
2. Go to the **Policies** tab
3. Click **New Policy** or **Add Policy**

#### Policy 1: Allow Public Read Access
```
Policy Name: Allow public read access
Target: Bucket
Operations: SELECT (Read)
Condition: Public (no authentication needed)
Effect: ALLOW
```

OR use this SQL directly in the SQL Editor:
```sql
CREATE POLICY "Allow public read access to property-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');
```

#### Policy 2: Allow Authenticated Users to Upload
```
Policy Name: Allow authenticated users to upload
Target: Bucket
Operations: INSERT
Condition: auth.role() = 'authenticated'
Effect: ALLOW
```

OR use this SQL:
```sql
CREATE POLICY "Allow authenticated users to upload property-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');
```

#### Policy 3: Allow Users to Delete Their Own Images
```
Policy Name: Allow users to delete their own images
Target: Bucket
Operations: DELETE
Condition: auth.role() = 'authenticated'
Effect: ALLOW
```

OR use this SQL:
```sql
CREATE POLICY "Allow users to delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');
```

### Step 6: Verify Storage Policies
Your policies should now be visible in the Storage tab showing:
- ✅ Public can read all files
- ✅ Authenticated users can upload
- ✅ Authenticated users can delete

## Files Created

### 1. `lib/supabase/storage.ts` - Helper Functions
Complete TypeScript module with:
- `uploadPropertyImage()` - Upload single image with progress
- `uploadPropertyImages()` - Upload multiple images
- `getPublicImageUrl()` - Get public URL for stored image
- `deletePropertyImage()` - Delete single image
- `deletePropertyImages()` - Delete multiple images
- `deletePropertyImages_()` - Delete all images for a property
- `getPropertyImages()` - Fetch all images for a property

### 2. `components/property/property-image-uploader.tsx` - UI Component
React component with:
- Drag & drop image upload
- Progress indicator
- Image gallery preview
- Delete functionality
- Error handling and notifications

## Usage Examples

### Basic Upload
```typescript
import { uploadPropertyImage } from '@/lib/supabase/storage'

// Upload an image
const result = await uploadPropertyImage(
  file,
  companyId,
  propertyId
)

if ('error' in result) {
  console.error(result.error)
} else {
  console.log('Image URL:', result.url)
  console.log('Image path:', result.path)
}
```

### In a React Component
```typescript
import { PropertyImageUploader } from '@/components/property/property-image-uploader'

export function PropertyForm() {
  const handleImagesUploaded = (urls: string[]) => {
    // Save URLs to database
    console.log('Uploaded images:', urls)
  }

  return (
    <PropertyImageUploader
      propertyId="prop-123"
      companyId="company-456"
      onImagesUploaded={handleImagesUploaded}
    />
  )
}
```

### Get All Images for Property
```typescript
import { getPropertyImages } from '@/lib/supabase/storage'

const result = await getPropertyImages(companyId, propertyId)
if ('error' in result) {
  console.error(result.error)
} else {
  console.log('Image URLs:', result.urls)
}
```

### Delete Image
```typescript
import { deletePropertyImage } from '@/lib/supabase/storage'

// Delete by path (path is returned from upload)
const result = await deletePropertyImage(filePath)
if ('error' in result) {
  console.error(result.error)
} else {
  console.log('Image deleted')
}
```

## Storage Structure

Images are organized in this folder structure:
```
property-images/
├── {company_id}/
│   ├── {property_id}/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── image3.png
│   └── {other_property_id}/
└── {other_company_id}/
```

This ensures:
- Data isolation by company
- Easy cleanup (delete all images for a property)
- Organized file structure
- Easy to implement RLS if needed in future

## File Size Limits

- **Max file size**: 5MB
- **Allowed formats**: All image types (png, jpg, gif, webp, etc.)

To change limits, edit the `MAX_FILE_SIZE` constant in `lib/supabase/storage.ts`

## Public URL Format

Once uploaded, images are accessible at:
```
https://uozchnrhxeiyywyvbyxb.supabase.co/storage/v1/object/public/property-images/{company_id}/{property_id}/{filename}
```

These URLs can be:
- Saved in the database
- Used directly in img tags
- Shared publicly

## Verification Checklist

✅ Bucket "property-images" created
✅ Bucket marked as PUBLIC
✅ Public read policy configured
✅ Authenticated upload policy configured
✅ Delete policy configured
✅ `lib/supabase/storage.ts` created with helper functions
✅ `property-image-uploader.tsx` component created
✅ Tested upload/delete functionality

## Troubleshooting

**Issue: Images not accessible (404)**
- Verify bucket is PUBLIC (🌐 icon)
- Check public read policy exists
- Verify file path is correct

**Issue: Upload fails with 403 Forbidden**
- User must be authenticated
- Check INSERT policy exists for authenticated users
- Verify session is valid

**Issue: Can't delete images**
- User must be authenticated
- Check DELETE policy exists for authenticated users
- Verify user owns the image (by checking created path)

## Next Steps

1. ✅ Storage bucket created
2. ✅ Storage policies configured
3. ✅ Helper functions created
4. ✅ Component created
5. Now: Integrate into property form to save image URLs in database
