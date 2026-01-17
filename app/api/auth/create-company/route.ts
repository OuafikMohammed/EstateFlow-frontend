// File: app/api/auth/create-company/route.ts
// Purpose: API route to create company and profile with service role access
// This bypasses RLS by using the service role key on the backend

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, companyName, email, fullName } = body

    // Validate required fields
    if (!userId || !companyName || !email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create admin client with service role key
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Step 1: Create company record
    const { data: companyData, error: companyError } = await adminClient
      .from('companies')
      .insert({
        name: companyName.trim(),
        email: email.toLowerCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (companyError || !companyData) {
      console.error('Company creation error:', companyError)
      return NextResponse.json(
        { error: companyError?.message || 'Failed to create company' },
        { status: 500 }
      )
    }

    const companyId = companyData.id

    // Step 2: Create user profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        company_id: companyId,
        full_name: fullName.trim(),
        role: 'admin', // First user is admin
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Cleanup: delete the company if profile creation fails
      try {
        await adminClient.from('companies').delete().eq('id', companyId)
      } catch (deleteError) {
        console.error('Error deleting company:', deleteError)
      }
      return NextResponse.json(
        { error: profileError?.message || 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        companyId,
        message: 'Company and profile created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
