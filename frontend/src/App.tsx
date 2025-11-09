import { CssBaseline, Box, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import OnboardingGuard from './shared/components/OnboardingGuard';
import PublicOnboardingGuard from './shared/components/PublicOnboardingGuard';
import GradientSpinnerAnimation from './shared/components/GradientSpinnerAnimation';
import { ga4Service } from './shared/services/ga4Service';
import { usePageTracking } from './shared/hooks/usePageTracking';
import { theme } from './shared/theme/theme';

// Create a client
const queryClient = new QueryClient();

// Lazy load feature pages
const StartPage = React.lazy(() => import('./features/start/StartPage'));
const RefinePage = React.lazy(() => import('./features/refine/RefinePage'));
const ExportPage = React.lazy(() => import('./features/export/ExportPage'));
const LoginPage = React.lazy(() => import('./features/auth/LoginPage'));
const SignupPage = React.lazy(() => import('./features/auth/SignupPage'));
const EmailConfirmationPage = React.lazy(() => import('./features/auth/EmailConfirmationPage'));
const EmailVerificationPage = React.lazy(() => import('./features/auth/EmailVerificationPage'));
const PasswordResetVerificationPage = React.lazy(() => import('./features/auth/PasswordResetVerificationPage'));
const RequestPasswordResetPage = React.lazy(() => import('./features/auth/RequestPasswordResetPage'));
const ResetPasswordPage = React.lazy(() => import('./features/auth/ResetPasswordPage'));
const OnboardingPage = React.lazy(() => import('./features/onboarding/OnboardingPage'));
const HomeRedirect = React.lazy(() => import('./shared/components/HomeRedirect'));
const PaymentSuccessPage = React.lazy(() => import('./features/export/PaymentSuccessPage'));
const BuilderPage = React.lazy(() => import('./features/builder/BuilderPage'));
const ProfileSettingsPage = React.lazy(() => import('./features/profile/ProfileSettingsPage'));
const UpgradePage = React.lazy(() => import('./features/upgrade/UpgradePage'));

function AppRoutes() {
  // Track page views automatically
  usePageTracking();
  
  return (
    <React.Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <GradientSpinnerAnimation size={50} />
      </Box>
    }>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={
          <ProtectedRoute requireAuth={false}>
            <SignupPage />
          </ProtectedRoute>
        } />
        <Route path="/auth/email-confirmed" element={<EmailConfirmationPage />} />
        <Route path="/auth/email-confirmation-error" element={<EmailConfirmationPage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="/auth/request-password-reset" element={<RequestPasswordResetPage />} />
        <Route path="/auth/reset-password-verification" element={<PasswordResetVerificationPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        
        {/* Onboarding route - accessible to authenticated users or guests with temp_file_id */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Publicly accessible creation flow for guests */}
        <Route path="/start" element={
          <PublicOnboardingGuard>
            <StartPage />
          </PublicOnboardingGuard>
        } />
        <Route path="/refine" element={
          <PublicOnboardingGuard>
            <RefinePage />
          </PublicOnboardingGuard>
        } />
        <Route path="/export" element={
          <PublicOnboardingGuard>
            <ExportPage />
          </PublicOnboardingGuard>
        } />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/builder" element={
          <PublicOnboardingGuard>
            <BuilderPage />
          </PublicOnboardingGuard>
        } />
        <Route path="/upgrade" element={
          <PublicOnboardingGuard>
            <UpgradePage />
          </PublicOnboardingGuard>
        } />
        
        {/* Profile Settings - Protected route */}
        <Route path="/profile-settings" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <ProfileSettingsPage />
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<HomeRedirect />} />
      </Routes>
    </React.Suspense>
  );
}

function App() {
  useEffect(() => {
    // Initialize GA4 if measurement ID is provided
    const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
    if (measurementId) {
      ga4Service.initialize(measurementId);
    } else {
      console.warn('VITE_GA4_MEASUREMENT_ID not found in environment variables');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
