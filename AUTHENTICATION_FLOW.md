# Authentication Flow Diagram

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE (/)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Header: [TidyGuru Logo]  [Sign In]  [Sign Up Free]     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  • Hero Section                                                  │
│  • Impact Section                                                │
│  • How It Works                                                  │
│  • Testimonials                                                  │
│  • CTA Section                                                   │
└─────────────────────────────────────────────────────────────────┘
                    │                          │
        ┌───────────┴──────────┐              │
        │                      │              │
        ▼                      ▼              ▼
┌──────────────┐      ┌──────────────┐    ┌──────────────┐
│   LOGIN      │      │   SIGNUP     │    │   FORGOT     │
│   /login     │      │   /signup    │    │  PASSWORD    │
└──────────────┘      └──────────────┘    │  /forgot-    │
        │                      │           │  password    │
        │                      │           └──────────────┘
        │                      │                   │
        │      ┌───────────────┘                   │
        │      │                        ┌──────────┘
        │      │                        │
        ▼      ▼                        ▼
    ┌─────────────────────────────────────────┐
    │  SUPABASE AUTHENTICATION                │
    │  • Validates credentials                │
    │  • Creates session                      │
    │  • Issues JWT token                     │
    └─────────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────────┐
    │         PROTECTED ROUTE CHECK           │
    │  • Is user authenticated?               │
    │  • Valid session token?                 │
    └─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
    ✅ YES                   ❌ NO
        │                       │
        ▼                       ▼
┌──────────────────┐    ┌──────────────┐
│   DASHBOARD      │    │  Redirect to │
│   /dashboard     │    │    /login    │
└──────────────────┘    └──────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────┐
│              DASHBOARD FEATURES                      │
│                                                      │
│  ┌────────────────────────────────────────────────┐│
│  │  Header: [Logo] [User Avatar ▼]               ││
│  │          └─ Settings                           ││
│  │          └─ Logout                             ││
│  └────────────────────────────────────────────────┘│
│                                                      │
│  • Upload CSV files                                 │
│  • View KPI metrics                                 │
│  • Revenue charts                                   │
│  • Top products analysis                            │
│  • Export to PDF/CSV                                │
│  • Data table with search                           │
└─────────────────────────────────────────────────────┘
        │
        │ (User clicks Settings)
        ▼
┌─────────────────────────────────────────────────────┐
│                SETTINGS PAGE                         │
│                 /settings                            │
│                                                      │
│  • Update profile name                              │
│  • View account details                             │
│  • Email (read-only)                                │
│  • User ID                                          │
│  • Member since date                                │
│  • Logout option                                    │
└─────────────────────────────────────────────────────┘
```

## Technical Flow

```
┌─────────────────────────────────────────────────────────┐
│                    APP INITIALIZATION                    │
│                                                          │
│  1. App.tsx wraps entire app with AuthProvider         │
│  2. AuthContext checks for existing session             │
│  3. Supabase.auth.getSession() called                   │
│  4. Sets user state if valid session exists             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  ROUTE RENDERING                         │
│                                                          │
│  Public Routes (No Auth Required):                      │
│    • /              → Index (Landing)                   │
│    • /login         → Login                             │
│    • /signup        → Signup                            │
│    • /forgot-password → ForgotPassword                  │
│                                                          │
│  Protected Routes (Auth Required):                      │
│    • /dashboard     → <ProtectedRoute><Dashboard />     │
│    • /settings      → <ProtectedRoute><Settings />      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              AUTHENTICATION ACTIONS                      │
│                                                          │
│  Login:                                                  │
│    1. User enters email/password                        │
│    2. Form validation (Zod schema)                      │
│    3. supabase.auth.signInWithPassword()                │
│    4. Success → Navigate to /dashboard                  │
│    5. Error → Show toast notification                   │
│                                                          │
│  Signup:                                                 │
│    1. User enters name, email, password                 │
│    2. Form validation (Zod schema)                      │
│    3. supabase.auth.signUp()                            │
│    4. Success → Navigate to /dashboard                  │
│    5. Error → Show toast notification                   │
│                                                          │
│  Logout:                                                 │
│    1. User clicks logout from menu                      │
│    2. supabase.auth.signOut()                           │
│    3. Clear user state                                  │
│    4. Navigate to /login                                │
│                                                          │
│  Password Reset:                                         │
│    1. User enters email                                 │
│    2. supabase.auth.resetPasswordForEmail()             │
│    3. Supabase sends reset email                        │
│    4. User clicks link in email                         │
│    5. Redirected to password reset page                 │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

```
App.tsx
├── AuthProvider (Context)
│   ├── Manages user state
│   ├── Provides auth methods
│   └── Listens to auth changes
│
└── BrowserRouter
    ├── Public Routes
    │   ├── Index.tsx (Landing Page)
    │   ├── Login.tsx
    │   ├── Signup.tsx
    │   └── ForgotPassword.tsx
    │
    └── Protected Routes
        ├── ProtectedRoute (Wrapper)
        │   ├── Checks authentication
        │   ├── Shows loading state
        │   └── Redirects if not authenticated
        │
        ├── Dashboard.tsx
        │   ├── useAuth() hook
        │   ├── File upload
        │   ├── Data visualization
        │   └── User menu
        │
        └── Settings.tsx
            ├── useAuth() hook
            ├── Profile form
            └── Account details
```

## State Management

```
AuthContext State:
├── user: User | null
│   ├── id
│   ├── email
│   ├── user_metadata
│   │   └── full_name
│   └── created_at
│
├── session: Session | null
│   ├── access_token
│   ├── refresh_token
│   └── expires_at
│
├── isAuthenticated: boolean
├── isLoading: boolean
│
└── Methods:
    ├── login(email, password)
    ├── signup(email, password, name)
    ├── logout()
    ├── resetPassword(email)
    └── updateProfile(data)
```

## Data Flow

```
┌──────────────────────────────────────────────────────┐
│              USER AUTHENTICATION                      │
│                                                       │
│  Browser ←→ React App ←→ Supabase ←→ Database       │
│           (AuthContext)    (Auth API)   (PostgreSQL) │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│              CSV DATA STORAGE                         │
│                                                       │
│  Upload → Parse → Store in localStorage              │
│           (Client-side only)                          │
│                                                       │
│  Note: Can be upgraded to store in Supabase Storage │
└──────────────────────────────────────────────────────┘
```

## Security Features

```
✅ Password Validation
   • Minimum 6 characters
   • Can be enhanced with regex patterns

✅ Protected Routes
   • ProtectedRoute component
   • Automatic redirects
   • Loading states

✅ Session Management
   • JWT tokens
   • Automatic refresh
   • Secure storage

✅ Form Validation
   • Zod schemas
   • Type-safe validation
   • Error messages

✅ Error Handling
   • Try-catch blocks
   • Toast notifications
   • User-friendly messages
```

## API Endpoints (Supabase)

All authentication goes through Supabase Auth API:

```
Base URL: https://bqjohfxzzfhrmqhgalcd.supabase.co

Endpoints Used:
├── POST /auth/v1/signup
├── POST /auth/v1/token?grant_type=password
├── POST /auth/v1/recover
├── POST /auth/v1/logout
├── PUT  /auth/v1/user
└── GET  /auth/v1/user
```

## Environment Variables

```typescript
// src/config/env.ts
config.supabase = {
  url: "https://bqjohfxzzfhrmqhgalcd.supabase.co",
  anonKey: "eyJ..." // Public anon key
}
```

Can also use `.env` file:
```bash
VITE_SUPABASE_URL=https://bqjohfxzzfhrmqhgalcd.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

---

This flow ensures secure, seamless authentication across your TidyGuru application! 🚀

