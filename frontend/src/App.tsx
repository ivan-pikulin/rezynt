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
const ChatPage = React.lazy(() => import('./features/chat/ChatPage'));
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
const CVUpgradeMainPage = React.lazy(() => import('./features/cvupgrade/CVUpgradeMainPage'));
const BuilderPage = React.lazy(() => import('./features/builder/BuilderPage'));

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
        
        {/* Onboarding route */}
        <Route path="/onboarding" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingPage />
          </ProtectedRoute>
        } />
        
        {/* Publicly accessible creation flow for guests */}
        <Route path="/start" element={
          <PublicOnboardingGuard>
            <StartPage />
          </PublicOnboardingGuard>
        } />
        <Route path="/chat" element={
          <PublicOnboardingGuard>
            <ChatPage />
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
        <Route path="/cvupgrade-main" element={<CVUpgradeMainPage />} />
        <Route path="/builder" element={
          <PublicOnboardingGuard>
            <BuilderPage />
          </PublicOnboardingGuard>
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
