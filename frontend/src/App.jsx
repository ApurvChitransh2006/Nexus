import React from 'react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Y2xlYW4tbW91c2UtOTEuY2xlcmsuYWNjb3VudHMuZGV2JA';

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <AuthPage />
      </SignedOut>
    </ClerkProvider>
  );
}
