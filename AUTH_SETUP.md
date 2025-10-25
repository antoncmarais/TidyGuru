# Authentication Setup Guide

## Overview

TidyGuru now has full authentication powered by **Supabase**. This guide explains how the authentication system works and how to use it.

## Features Implemented ✅

- ✅ **User Registration** - Sign up with email and password
- ✅ **User Login** - Secure authentication with session management
- ✅ **Password Reset** - Forgot password flow with email
- ✅ **Protected Routes** - Dashboard and settings require authentication
- ✅ **User Profile** - View and update profile information
- ✅ **Session Persistence** - Stay logged in across browser sessions
- ✅ **Logout** - Secure session termination

## Pages & Routes

### Public Routes (No Authentication Required)
- `/` - Landing page with product information
- `/login` - User login page
- `/signup` - New user registration
- `/forgot-password` - Password reset request

### Protected Routes (Authentication Required)
- `/dashboard` - Main analytics dashboard with CSV upload
- `/settings` - User profile and account settings

## Quick Start

### 1. Environment Setup

Your Supabase credentials are configured in `src/config/env.ts`:

```typescript
supabase: {
  url: "https://bqjohfxzzfhrmqhgalcd.supabase.co",
  anonKey: "your-anon-key-here"
}
```

Alternatively, you can create a `.env` file (optional):

```bash
VITE_SUPABASE_URL=https://bqjohfxzzfhrmqhgalcd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:8080` to see the landing page.

## User Flow

### First-Time User
1. Visit landing page at `/`
2. Click "Sign Up Free"
3. Enter name, email, and password
4. Redirected to `/dashboard`
5. Upload CSV to start analyzing data

### Returning User
1. Visit landing page at `/`
2. Click "Sign In"
3. Enter email and password
4. Redirected to `/dashboard` with previous data loaded

### Forgot Password
1. Click "Forgot password?" on login page
2. Enter email address
3. Check email for reset link (Supabase sends this automatically)
4. Click link in email to reset password

## Technical Details

### Authentication Context

The `AuthContext` (`src/contexts/AuthContext.tsx`) provides:

```typescript
{
  user: User | null;              // Current user object
  session: Session | null;        // Current session
  isAuthenticated: boolean;       // Quick auth check
  isLoading: boolean;            // Loading state
  login: (email, password) => Promise<void>;
  signup: (email, password, name) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email) => Promise<void>;
  updateProfile: (data) => Promise<void>;
}
```

### Usage in Components

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.email}</div>;
}
```

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

This automatically redirects unauthenticated users to `/login`.

## Supabase Configuration

### Email Settings

By default, Supabase requires email confirmation for new users. To disable this for development:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Settings**
3. Uncheck "Enable email confirmations"

### Email Templates

Customize email templates in Supabase:
- **Authentication** → **Email Templates**
- Edit "Confirm signup", "Magic Link", "Reset Password" templates

### Redirect URLs

Make sure your app URL is added to allowed redirect URLs:
1. **Authentication** → **URL Configuration**
2. Add `http://localhost:8080/*` for development
3. Add your production URL when deploying

## Data Persistence

- **User data** is stored in Supabase
- **CSV data & analysis** is stored in browser localStorage
- **Session tokens** are managed by Supabase client

This means:
- User accounts sync across devices
- CSV data is device-specific (can be changed to use Supabase storage)
- Sessions persist across browser restarts

## Security Features

✅ **Password Requirements**: Minimum 6 characters (configurable)
✅ **JWT Tokens**: Secure session management
✅ **HTTPS**: Required in production
✅ **Email Verification**: Optional (can be enabled in Supabase)
✅ **Rate Limiting**: Built into Supabase Auth

## Customization

### Change Password Requirements

Edit validation schemas in:
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`

```typescript
const signupSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number"),
});
```

### Add Social Login (Google, GitHub, etc.)

1. Enable providers in Supabase dashboard
2. Update `AuthContext.tsx` to add social login methods
3. Add buttons to Login/Signup pages

### Email Confirmation Required

If email confirmation is enabled, users will receive a confirmation email after signup:

```typescript
// In AuthContext.tsx signup method
if (data.user && !data.session) {
  toast({
    title: "Check your email",
    description: "We've sent you a confirmation link",
  });
}
```

## Troubleshooting

### "User not found" Error
- Make sure you've signed up first before trying to log in
- Check Supabase dashboard → Authentication → Users to see registered users

### Session Not Persisting
- Clear browser localStorage and cookies
- Check that Supabase URL and anon key are correct
- Verify redirect URLs are configured in Supabase

### Email Not Sending
- Check Supabase email settings
- For production, configure SMTP in Supabase
- Development uses Supabase's built-in email (limited)

## Next Steps

### Recommended Enhancements

1. **Store CSV data in Supabase**
   - Create a `sales_data` table
   - Upload CSV rows to database instead of localStorage
   - Enables cross-device data access

2. **Add User Roles**
   - Admin, user, viewer roles
   - Team collaboration features
   - Row-level security policies

3. **Implement Teams**
   - Create organizations/workspaces
   - Share dashboards with team members
   - Team-wide data access

4. **Add Social Authentication**
   - Google Sign-In
   - GitHub OAuth
   - LinkedIn, etc.

5. **Two-Factor Authentication**
   - Supabase supports 2FA
   - Add to settings page

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs/guides/auth
- Review React Query docs for data fetching: https://tanstack.com/query/latest

## Credits

- **Supabase** - Authentication & Backend
- **shadcn/ui** - UI Components
- **React Hook Form** - Form handling
- **Zod** - Schema validation

