The Problem

You were seeing two different headers on the register and login pages:

1. "MovieRec" - from the Navigation component that was being rendered globally
2. "Moveere" - from the individual auth page headers in RegisterPage and LoginPage

The Solution

I modified App.tsx to conditionally render the Navigation component:

1. Created AppContent component that uses useLocation() to detect the current route
2. Added conditional logic to exclude Navigation from auth pages:
const isAuthPage = ['/login', '/register'].includes(location.pathname)
return (
  <div className="min-h-screen bg-gray-50">
    {!isAuthPage && <Navigation />}
    {/* ... */}
  </div>
)
3. Wrapped AppContent in Router to provide routing context for useLocation()

Result

Now the auth pages (/login and /register) will only show:

- "Moveere" header from their individual page components
- No duplicate "MovieRec" navigation

All other pages will continue to show the Navigation component with "MovieRec" as expected.

The login and register pages now have clean, single headers with just the "Moveere" branding as intended.
