# EstateFlow Production Deployment Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# ============================================================================
# NEXT.JS & APP CONFIGURATION
# ============================================================================

# Your production domain
NEXT_PUBLIC_APP_URL=https://your-domain.com

# NextAuth configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here-min-32-characters

# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================

# Get these from Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key for server-side operations
# KEEP THIS SECRET - Never expose to client
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================================================
# SECURITY & RATE LIMITING
# ============================================================================

# Internal secret for webhook verification
INTERNAL_SECRET=your-internal-secret-here

# Additional allowed origins (comma-separated)
# For local development: http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# ============================================================================
# GOOGLE OAUTH (OPTIONAL)
# ============================================================================

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============================================================================
# LOGGING & MONITORING (OPTIONAL)
# ============================================================================

LOG_LEVEL=info
# Sentry or other error tracking
NEXT_PUBLIC_SENTRY_DSN=
```

## Security Best Practices Implemented

### 1. Rate Limiting
- **Public Endpoints**: Strict limits (login: 5 requests/15min, signup: 3 requests/hour)
- **Authenticated Endpoints**: Generous limits (1000 requests/minute)
- **Key Generation**: Per-IP and per-user combination for defense against account enumeration
- **Storage**: In-memory with automatic cleanup (production should use Redis)

### 2. Input Validation
- **Zod Schemas**: All inputs validated against strict schemas
- **Field Constraints**: Length limits, format validation, required fields
- **Password Requirements**: 
  - Minimum 12 characters
  - Uppercase, lowercase, numbers, and special characters required
- **Error Messages**: Generic errors to prevent information disclosure

### 3. Authentication & Authorization
- **Supabase Auth**: Modern JWT-based authentication
- **RLS Policies**: Database-level access control via Supabase Row Level Security
- **Session Management**: 7-day JWT tokens with refresh capability
- **Company Isolation**: Multi-tenant architecture with company-based access control

### 4. API Security
- **HTTPS Only**: All endpoints require HTTPS in production
- **CORS**: Strict origin validation
- **Security Headers**: 
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff
  - Content-Security-Policy: default-src 'none'
- **Method Validation**: Explicit method constraints on all endpoints

### 5. Data Protection
- **Password Hashing**: bcryptjs with cost factor 12
- **Sensitive Data Masking**: In logs and error messages
- **No Keys in Client**: All API keys use environment variables
- **Encrypted Database**: Supabase provides at-rest encryption

## Database Schema Overview

### Core Tables
- **profiles**: User accounts with role-based access
- **companies**: Company information and settings
- **properties**: Real estate listings with full details
- **leads**: Lead management with status tracking
- **lead_activities**: Activity history for each lead

### RLS Policies
All tables implement row-level security:
- Agents can only see their company's data
- Clients have read-only access to assigned properties
- Company admins can manage all company data

See `supabase-schema.sql` for complete schema definition.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration with company creation
- `POST /api/auth/login` - Credential verification
- `POST /api/auth/password-reset` - Password reset request

### Properties
- `GET /api/properties` - List properties with pagination
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead status

### Clients
- `GET /api/clients` - List company clients
- `POST /api/clients` - Create client

## Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Validation error or bad request
- `401`: Unauthorized (missing/invalid credentials)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (with intelligent redirect)
- `429`: Rate limit exceeded (with Retry-After header)
- `500`: Server error

### Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": { "field": ["specific error"] },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Loading States & UX

All pages include consistent loading skeletons:
- Dashboard: Stats cards and charts
- Properties: Grid layout with image placeholders
- Clients/Leads: Table rows with content skeletons
- Showings: Calendar view placeholders

Loading states use the same design system (colors, spacing, typography).

## Deployment Checklist

- [ ] All environment variables set in production
- [ ] NEXTAUTH_SECRET is a strong random string (min 32 chars)
- [ ] Supabase service role key is secure and never exposed
- [ ] Database migrations applied: `pnpm supabase migration up`
- [ ] RLS policies enabled on all tables
- [ ] CORS origins configured correctly
- [ ] Email confirmation enabled in Supabase Auth
- [ ] Rate limiter upgraded to Redis for distributed deployment
- [ ] Error logging configured (Sentry, DataDog, etc.)
- [ ] Monitoring alerts set up
- [ ] Regular backups configured
- [ ] SSL/TLS certificate installed
- [ ] NEXT_PUBLIC_APP_URL matches your domain

## Development vs Production

### Development (.env.local)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

### Production (.env.production.local)
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

## Monitoring & Logging

### Key Metrics to Monitor
- Request rate limit violations
- Failed login attempts
- API response times
- Database query performance
- Supabase auth errors
- Rate limiter hit rate

### Log Errors
All security-relevant errors are logged:
- Failed authentication attempts
- Rate limit violations
- Validation errors
- Unauthorized access attempts

## Future Improvements

1. **Distributed Rate Limiting**: Migrate from in-memory to Redis
2. **WebAuthn Support**: Passwordless authentication
3. **API Key Management**: For third-party integrations
4. **Audit Logging**: Track all data changes
5. **Advanced Analytics**: Detailed usage metrics
6. **Webhook Events**: Real-time integrations
7. **GraphQL API**: Alternative to REST endpoints

## Security References

- [OWASP Top 10 API Security Risks](https://owasp.org/www-project-api-security/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [NextAuth.js Best Practices](https://next-auth.js.org/getting-started/example)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Support

For security issues, please report privately to your security team. Do not open public issues for security vulnerabilities.
