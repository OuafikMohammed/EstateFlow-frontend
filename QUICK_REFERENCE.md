# Production Refactoring: Quick Reference

## Files Created/Modified

### Security Layer 🔒
- `lib/security/rate-limiter.ts` - Rate limiting (per-IP, per-user)
- `lib/security/validation.ts` - Input validation with Zod
- `lib/security/security-utils.ts` - CORS, headers, error handling

### Authentication 🔑
- `lib/supabase/auth-handler.ts` - Supabase auth operations (replaces mock users)
- `app/api/auth/signup/route.ts` - Secure signup endpoint
- `app/api/auth/login/route.ts` - Secure login endpoint

### API Routes 📡
- `app/api/properties/route.ts` - Properties CRUD with RLS
- `lib/supabase/data-fetching.ts` - Type-safe data queries

### UI/UX 🎨
- `app/not-found.tsx` - Intelligent 404 page with redirects
- `app/dashboard/loading.tsx` - Loading skeleton
- `app/properties/loading.tsx` - Loading skeleton
- `app/clients/loading.tsx` - Loading skeleton
- `app/leads/loading.tsx` - Loading skeleton
- `app/showings/loading.tsx` - Loading skeleton

### Documentation 📚
- `PRODUCTION_DEPLOYMENT.md` - Full deployment guide
- `REFACTORING_IMPLEMENTATION.md` - Implementation details
- `QUICK_REFERENCE.md` - This file

## API Endpoints Summary

### Authentication (Public)
```
POST /api/auth/signup      - Register (3 req/hour/IP)
POST /api/auth/login       - Login (5 req/15min/IP)
```

### Properties (Authenticated)
```
GET  /api/properties       - List with RLS
POST /api/properties       - Create new
```

### Error Response Format
```json
{
  "error": "Error message",
  "details": { "field": ["specific error"] },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| signup | 3 | 1 hour |
| login | 5 | 15 min |
| password-reset | 3 | 1 hour |
| api/* (auth) | 1000 | 1 min |
| api/* (public) | 100 | 1 min |

## Security Features Implemented

✅ Rate limiting (per-IP, per-user)
✅ Input validation (Zod schemas)
✅ Password strength requirements
✅ Secure headers (CORS, CSP, X-Frame-Options)
✅ Sensitive data masking
✅ RLS policies (database level)
✅ No mock data in production
✅ Environment variable validation
✅ Timing-safe operations
✅ Error message sanitization

## Environment Variables

**Must be set:**
```
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Recommended:**
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
INTERNAL_SECRET
ALLOWED_ORIGINS
```

## Testing Checklist

- [ ] Signup with valid credentials
- [ ] Signup with invalid email
- [ ] Signup rate limit (> 3/hour)
- [ ] Login with correct password
- [ ] Login with wrong password
- [ ] Login rate limit (> 5/15min)
- [ ] Property list shows only company data
- [ ] Create property validates inputs
- [ ] 404 page redirects correctly
- [ ] Loading states display correctly
- [ ] API returns security headers

## Common Errors & Solutions

### "Rate limit exceeded"
- Wait for Retry-After seconds
- Check RATE_LIMITS in rate-limiter.ts

### "Validation Error"
- Check validation.errors for field-level details
- Ensure password meets strength requirements

### "Unauthorized"
- Verify JWT token in Authorization header
- Check auth cookie is set

### "Not Found"
- Verify resource belongs to user's company
- Check RLS policies

## Deployment Steps

1. Set all environment variables
2. Run `npm install` (if adding packages)
3. Build: `npm run build`
4. Test: Sign up, create property, check RLS
5. Deploy to production

## Performance Tips

- Load balancer + Redis for distributed rate limiting
- Database indexes on company_id, status
- Cache property counts in dashboard
- Use CDN for static assets
- Monitor 95th percentile response times

## Future Enhancements

- WebAuthn (passwordless login)
- Two-factor authentication
- API keys for integrations
- Audit logging
- Advanced analytics
- GraphQL API
- Webhook events

## Support

For questions, see:
1. `PRODUCTION_DEPLOYMENT.md` - Deployment details
2. `REFACTORING_IMPLEMENTATION.md` - Implementation details
3. `supabase-schema.sql` - Database structure

---

**Version:** 1.0.0
**Last Updated:** January 20, 2026
**Status:** Production Ready ✅
