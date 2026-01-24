import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Generate unique file name
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const fileName = `${timestamp}-${random}-${file.name}`

      // Convert file to buffer
      const buffer = await file.arrayBuffer()

      // Upload using admin client (bypasses RLS)
      const { data, error } = await supabaseAdmin.storage
        .from('properties')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        console.error(`Upload error for ${file.name}:`, error)
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${error.message}` },
          { status: 500 }
        )
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('properties')
        .getPublicUrl(data.path)

      uploadedUrls.push(publicUrlData.publicUrl)
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
