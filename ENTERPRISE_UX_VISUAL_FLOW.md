# Enterprise Signup Journey - Visual Flow Guide

## Complete User Experience Map

### 🎯 Journey States

```
┌─────────────────────────────────────────────────────────────────┐
│ LANDING PAGE (/)                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  EstateFlow - Transform Your Real Estate Business        │  │
│  │                                                            │  │
│  │  [🎬 3D Hero Scene Background]                           │  │
│  │                                                            │  │
│  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━┓  ┌─────────────────────┐  │  │
│  │  ┃ Start Free Trial      ▶  ┃  │ Watch Demo          │  │  │
│  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━┛  └─────────────────────┘  │  │
│  │                                                            │  │
│  │  No credit card • 14-day trial • Cancel anytime          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Navigation: [Sign In] [Get Started ▶]                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
                    [User clicks CTA]
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ SIGNUP FORM (/signup)                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     EstateFlow                            │  │
│  │    Enterprise real estate management platform             │  │
│  │                                                            │  │
│  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │  │
│  │  ┃ Create Your Account                                ┃  │  │
│  │  ┃ Set up your company workspace                     ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ Full Name *                                        ┃  │  │
│  │  ┃ [John Doe________________]                        ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ Company Name *                                     ┃  │  │
│  │  ┃ [Acme Realty___________]                         ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ Work Email *                                       ┃  │  │
│  │  ┃ [you@company.com________]                        ┃  │  │
│  │  ┃  ✓ Email looks good                              ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ Password *                                         ┃  │  │
│  │  ┃ [••••••••••••••____] [👁]                        ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ Password Strength Indicator:                       ┃  │  │
│  │  ┃ ✓ 12+ characters                                  ┃  │  │
│  │  ┃ ✓ Uppercase letter                                ┃  │  │
│  │  ┃ ✓ Lowercase letter                                ┃  │  │
│  │  ┃ ✓ Number                                          ┃  │  │
│  │  ┃ ○ Special character                               ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ Confirm Password *                                 ┃  │  │
│  │  ┃ [••••••••••••••____] [👁]                        ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ ☐ I agree to Terms & Privacy                     ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ ┏━━━━━━━━━━━━━━━┓                                ┃  │  │
│  │  ┃ ┃ Create Account ┃                                ┃  │  │
│  │  ┃ ┗━━━━━━━━━━━━━━━┛                                ┃  │  │
│  │  ┃                                                    ┃  │  │
│  │  ┃ Already have account? Sign in                     ┃  │  │
│  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
                 [Form validation: Success]
                  [Submit to backend API]
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND PROCESSING (/api/auth/signup)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 1. ✓ Rate limit check (3/hour per IP)                          │
│ 2. ✓ Input validation                                           │
│ 3. ✓ Create Supabase auth user                                  │
│ 4. ✓ Create company workspace                                   │
│ 5. ✓ Create user profile (Company Admin)                        │
│ 6. ✓ Return success response                                    │
│                                                                   │
│ USER IS NOW LOGGED IN & AUTHENTICATED                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
            [Auto-redirect to /onboarding]
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ONBOARDING WIZARD (/onboarding)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Welcome to EstateFlow                                          │
│  Let's set up your Company Name workspace                       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Progress: Step 1 of 3                  [Skip for now]   │  │
│  │                                                          │  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │ (33% Complete)                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────┬─────┬─────┐                                           │
│  │  📤  │  📋  │  👥  │                                         │
│  │ Logo │Details│ Invite│                                       │
│  └──●──┴─────┴─────┘  [● = current]                          │
│                                                                   │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓        │
│  ┃ Company Logo                                       ┃        │
│  ┃ Upload your company logo for branding             ┃        │
│  ┃                                                   ┃        │
│  ┃     ┌──────────────────────────────────────┐     ┃        │
│  ┃     │   📤 UPLOAD AREA                      │     ┃        │
│  ┃     │   Click or drag & drop                │     ┃        │
│  ┃     │   PNG, JPG, SVG (max 5MB)            │     ┃        │
│  ┃     └──────────────────────────────────────┘     ┃        │
│  ┃                                                   ┃        │
│  ┃ ┏━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━┓              ┃        │
│  ┃ ┃ ← Back  ┃  ┃ Continue →       ┃              ┃        │
│  ┃ ┗━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━┛              ┃        │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛        │
│                                                                   │
│  [Option 1: Skip] ──────────┐                                  │
│  [Option 2: Continue] ──────┤─────► STEP 2                    │
│  [Option 3: Next Button] ───┘                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Transitions

### Step 1 → Step 2

```
┌─────────────────────────────────────────────────────────────────┐
│ ONBOARDING WIZARD - STEP 2 (/onboarding)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Progress: Step 2 of 3                                          │
│  ██████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  (66% Complete)                                                 │
│                                                                   │
│  ┌─────┬─────┬─────┐                                           │
│  │  ✓   │  📋  │  👥  │                                         │
│  │ Logo │Details│ Invite│  [✓ = completed]                    │
│  └─────┴──●──┴─────┘                                          │
│                                                                   │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓        │
│  ┃ Company Details                                  ┃        │
│  ┃ Tell us more about your organization            ┃        │
│  ┃                                                 ┃        │
│  ┃ Industry (optional)                             ┃        │
│  ┃ [e.g., Real Estate________________]           ┃        │
│  ┃                                                 ┃        │
│  ┃ Team Size (optional)                            ┃        │
│  ┃ [Select team size ▼]                           ┃        │
│  ┃ • 1-5 people                                   ┃        │
│  ┃ • 6-20 people                                  ┃        │
│  ┃ • 21-50 people                                 ┃        │
│  ┃ • 51+ people                                   ┃        │
│  ┃                                                 ┃        │
│  ┃ Phone Number (optional)                         ┃        │
│  ┃ [+1 (555) 000-0000__________________]         ┃        │
│  ┃                                                 ┃        │
│  ┃ Address (optional)                              ┃        │
│  ┃ [Your company address________________]        ┃        │
│  ┃                                                 ┃        │
│  ┃ ┏━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━┓              ┃        │
│  ┃ ┃ ← Back  ┃  ┃ Continue →       ┃              ┃        │
│  ┃ ┗━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━┛              ┃        │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2 → Step 3

```
┌─────────────────────────────────────────────────────────────────┐
│ ONBOARDING WIZARD - STEP 3 (/onboarding)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Progress: Step 3 of 3                                          │
│  ████████████████████████████████████████░░░░░░░░░░░░░░░░░░░ │
│  (100% Complete)                                                │
│                                                                   │
│  ┌─────┬─────┬─────┐                                           │
│  │  ✓   │  ✓   │  👥  │  [All ready for final step]           │
│  │ Logo │Details│ Invite│                                      │
│  └─────┴─────┴──●──┘                                          │
│                                                                   │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓        │
│  ┃ Invite Team Member                             ┃        │
│  ┃ Optionally invite your first team member       ┃        │
│  ┃                                                 ┃        │
│  ┃ Team Member Email (optional)                    ┃        │
│  ┃ ┌─────────────────────────────────┬──────────┐ ┃        │
│  ┃ │ colleague@company.com           │Send Invite
│ ┃        │
│  ┃ └─────────────────────────────────┴──────────┘ ┃        │
│  ┃                                                 ┃        │
│  ┃ 💡 Tip: Add team members anytime from settings ┃        │
│  ┃                                                 ┃        │
│  ┃ ┏━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━┓              ┃        │
│  ┃ ┃ ← Back  ┃  ┃ Get Started ✓  ┃              ┃        │
│  ┃ ┗━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━┛              ┃        │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛        │
│                                                                   │
│  [Skip setup and go to dashboard]                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3 → Dashboard

```
[Get Started Button] → Submit onboarding data → /api/onboarding/complete
                              ↓
                    ✓ Save company details
                    ✓ Upload logo (if provided)
                    ✓ Send invitations (if provided)
                              ↓
                    Auto-redirect to /dashboard
```

---

## Final Dashboard State

```
┌─────────────────────────────────────────────────────────────────┐
│ DASHBOARD (/dashboard)                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Left Sidebar                │ Main Content Area         │   │
│  │ ─────────────────────────────────────────────────────  │   │
│  │ [Logo]  EstateFlow           │                           │   │
│  │                              │ Dashboard                 │   │
│  │ [📊] Dashboard               │ Welcome back! Here's      │   │
│  │ [🏢] Properties              │ what's happening today.   │   │
│  │ [👥] Leads                   │                           │   │
│  │ [📅] Showings                │ ┌───┬───┬───┬───┐       │   │
│  │ [⚙️] Settings                │ │47 │23 │8  │420K│       │   │
│  │ [🚪] Logout                  │ │Pro│Lds│Sld│Rev │       │   │
│  │                              │ └───┴───┴───┴───┘       │   │
│  │                              │                           │   │
│  │                              │ [Charts & Analytics]      │   │
│  │                              │                           │   │
│  │                              │ [Recent Activity]         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│ ✅ JOURNEY COMPLETE                                             │
│ User is fully authenticated and can access all features         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error & Validation States

### Form Validation - Live Feedback

```
Email Field Examples:
❌ Empty         → "Email is required"
❌ invalid       → "Please enter a valid email"
⏳ Processing    → "Checking availability..."
✓ valid@comp.com → "✓ Email looks good" (green)

Password Strength:
○○○○○ (0/5 met)  → "Enter password..."
●●●●○ (4/5 met)  → "Almost there! Add special character"
●●●●● (5/5 met)  → "✓ Strong password" (green)

Passwords Match:
❌ Not matching   → "Passwords must match"
✓ Matching      → "✓ Passwords match" (green)
```

### API Error States

```
Rate Limited:
┌─────────────────────────────────────┐
│ ⚠️  Too many signup attempts         │
│ Try again in 45 minutes              │
└─────────────────────────────────────┘

Duplicate Email:
┌─────────────────────────────────────┐
│ ❌ Email already registered           │
│ Please sign in or reset password     │
└─────────────────────────────────────┘

Server Error:
┌─────────────────────────────────────┐
│ ❌ An error occurred                 │
│ Please try again in a few moments    │
└─────────────────────────────────────┘
```

---

## Responsive Behavior

### Mobile (< 768px)
```
┌────────────────────────┐
│ [≡] EstateFlow         │  Header collapses to hamburger menu
├────────────────────────┤
│                        │
│  [Full Width Form]     │  Form takes full width with padding
│                        │
│  ┏━━━━━━━━━━━━━━━━━━┓ │
│  ┃ Field 1         ┃ │  Stack in single column
│  ┗━━━━━━━━━━━━━━━━━━┛ │
│  ┏━━━━━━━━━━━━━━━━━━┓ │
│  ┃ Field 2         ┃ │
│  ┗━━━━━━━━━━━━━━━━━━┛ │
│                        │
│  ┏━━━━━━━━━━━━━━━━━━┓ │  Full width button
│  ┃ Submit Button   ┃ │
│  ┗━━━━━━━━━━━━━━━━━━┛ │
│                        │
│  Sign in link          │
└────────────────────────┘
```

### Tablet (768px - 1024px)
```
Half-width form centered on page
Two-column layout where applicable
```

### Desktop (> 1024px)
```
Centered card layout
Max-width container (md: 448px)
Full feature implementations
```

---

## Accessibility Features

✅ **Keyboard Navigation**
- Tab through all form fields
- Enter to submit form
- Shift+Tab to go back

✅ **Screen Reader Support**
- Proper ARIA labels on all inputs
- Error messages linked to fields
- Progress indicator announced

✅ **Color Accessibility**
- Not relying on color alone for status
- Text labels always present
- High contrast ratios (WCAG AA)

✅ **Focus Management**
- Clear focus indicators on buttons
- Focus trap in modals
- Focus restored after dismissal

---

## Performance Indicators

```
Time to Interactive (TTI): < 2.5s
First Contentful Paint (FCP): < 1.5s
Largest Contentful Paint (LCP): < 2.5s
Cumulative Layout Shift (CLS): < 0.1
```

---

## Browser Compatibility

```
✓ Chrome 90+
✓ Firefox 88+
✓ Safari 14+
✓ Edge 90+
✓ Mobile Chrome (Latest)
✓ Mobile Safari iOS 14+
```

---

**Last Updated**: January 20, 2026  
**Version**: 1.0 - Complete  
**Status**: Production Ready ✅
