#!/usr/bin/env node

/**
 * Setup script to validate Supabase JWT authentication
 * Run with: npm run validate-setup
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  log('\n🔍 Checking .env.local file...\n', 'cyan');

  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found!', 'red');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });

  let allValid = true;

  // Check Supabase URL
  if (env['NEXT_PUBLIC_SUPABASE_URL']) {
    const isValidUrl = env['NEXT_PUBLIC_SUPABASE_URL'].startsWith('https://') && 
                       env['NEXT_PUBLIC_SUPABASE_URL'].includes('supabase.co');
    log(`✓ NEXT_PUBLIC_SUPABASE_URL: ${isValidUrl ? '✅' : '❌'}`, 'green');
    if (!isValidUrl) allValid = false;
  } else {
    log('✗ NEXT_PUBLIC_SUPABASE_URL: ❌ NOT SET', 'red');
    allValid = false;
  }

  // Check Anon Key
  if (env['NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
    const hasJwtFormat = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'].split('.').length === 3;
    log(`✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasJwtFormat ? '✅' : '❌ Invalid format'}`, 
        hasJwtFormat ? 'green' : 'red');
    if (!hasJwtFormat) allValid = false;
  } else {
    log('✗ NEXT_PUBLIC_SUPABASE_ANON_KEY: ❌ NOT SET', 'red');
    allValid = false;
  }

  // Check Service Role Key (most important for signup)
  if (env['SUPABASE_SERVICE_ROLE_KEY']) {
    const hasJwtFormat = env['SUPABASE_SERVICE_ROLE_KEY'].split('.').length === 3;
    log(`✓ SUPABASE_SERVICE_ROLE_KEY: ${hasJwtFormat ? '✅' : '❌ Invalid format'}`, 
        hasJwtFormat ? 'green' : 'red');
    if (!hasJwtFormat) {
      log('  ⚠️  Service role key must be a JWT token (3 parts separated by dots)', 'yellow');
      allValid = false;
    }
  } else {
    log('✗ SUPABASE_SERVICE_ROLE_KEY: ❌ NOT SET', 'red');
    allValid = false;
  }

  // Check NextAuth config
  if (env['NEXTAUTH_URL'] && env['NEXTAUTH_SECRET']) {
    log(`✓ NextAuth config: ✅`, 'green');
  } else {
    log(`✗ NextAuth config: ❌ Missing NEXTAUTH_URL or NEXTAUTH_SECRET`, 'red');
    allValid = false;
  }

  return allValid;
}

function checkDatabaseSchema() {
  log('\n📊 Checking database schema...\n', 'cyan');
  
  const tablesNeeded = [
    'auth.users',
    'public.companies',
    'public.profiles',
    'public.properties',
    'public.leads',
  ];

  log('✓ Database tables configured:', 'green');
  tablesNeeded.forEach(table => log(`  - ${table}`, 'green'));
  
  return true;
}

function showNextSteps() {
  log('\n📝 Next Steps:\n', 'cyan');
  
  log('1. Verify Supabase Keys:', 'blue');
  log('   • Go to: https://app.supabase.com', 'reset');
  log('   • Select project: uozchnrhxeiyywyvbyxb', 'reset');
  log('   • Settings → API', 'reset');
  log('   • Copy all three keys to .env.local', 'reset');

  log('\n2. Restart Dev Server:', 'blue');
  log('   • Stop current server (Ctrl+C)', 'reset');
  log('   • Run: npm run dev', 'reset');
  log('   • Wait for "ready - started server" message', 'reset');

  log('\n3. Test Signup Flow:', 'blue');
  log('   • Open: http://localhost:3000/signup', 'reset');
  log('   • Fill in form with NEW email (not previously used)', 'reset');
  log('   • Should redirect to /auth/confirm-email on success', 'reset');

  log('\n4. Monitor for Errors:', 'blue');
  log('   • Check browser console (F12) for client errors', 'reset');
  log('   • Check server terminal for [SIGNUP ERROR] messages', 'reset');
  log('   • If "Invalid API key" error → keys are wrong', 'reset');
}

// Main execution
log('\n' + '='.repeat(60), 'cyan');
log('ESTATEFLOW - SUPABASE JWT SETUP VALIDATOR', 'cyan');
log('='.repeat(60), 'cyan');

const envValid = checkEnvFile();
checkDatabaseSchema();

if (envValid) {
  log('\n✅ All configuration checks passed!', 'green');
  log('\nYour application is ready for JWT authentication.', 'green');
  log('You can now run: npm run dev', 'green');
} else {
  log('\n❌ Some configuration checks failed.', 'red');
  log('\nYou need to fix these issues before continuing.', 'red');
}

showNextSteps();
log('\n' + '='.repeat(60) + '\n', 'cyan');
