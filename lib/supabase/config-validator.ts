/**
 * Supabase Configuration Validator
 * Run on server startup to validate JWT keys are correct
 */

import { createAdminClient } from '@/lib/supabase/server'

interface ConfigCheck {
  url: boolean
  anonKey: boolean
  serviceRoleKey: boolean
  connection: boolean
  error?: string
}

export async function validateSupabaseConfig(): Promise<ConfigCheck> {
  const check: ConfigCheck = {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    connection: false,
  }

  // Validate format
  if (check.serviceRoleKey && !process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('.')) {
    check.error = 'Service role key format invalid - should be a JWT token with 3 parts'
    return check
  }

  // Test connection
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('companies').select('id').limit(1)
    
    if (error?.message.includes('Invalid API key')) {
      check.connection = false
      check.error = 'Service role key is invalid for this Supabase project'
    } else {
      check.connection = true
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('Invalid API key')) {
      check.error = 'Service role key is invalid - get a fresh one from Supabase dashboard'
      check.connection = false
    } else {
      check.error = message
    }
  }

  return check
}

export function logConfigStatus(config: ConfigCheck): void {
  console.log('\n' + '='.repeat(60))
  console.log('SUPABASE CONFIGURATION CHECK')
  console.log('='.repeat(60))
  console.log(`✓ SUPABASE_URL: ${config.url ? '✅' : '❌'}`)
  console.log(`✓ ANON_KEY: ${config.anonKey ? '✅' : '❌'}`)
  console.log(`✓ SERVICE_ROLE_KEY: ${config.serviceRoleKey ? '✅' : '❌'}`)
  console.log(`✓ Database Connection: ${config.connection ? '✅' : '❌'}`)
  
  if (config.error) {
    console.log(`\n⚠️  ERROR: ${config.error}`)
    console.log('\nFIX:')
    console.log('1. Go to https://app.supabase.com')
    console.log('2. Select your project (uozchnrhxeiyywyvbyxb)')
    console.log('3. Go to Settings → API')
    console.log('4. Copy fresh keys to .env.local')
    console.log('5. Restart the dev server')
  } else {
    console.log('\n✅ All checks passed - JWT authentication ready!')
  }
  console.log('='.repeat(60) + '\n')
}
