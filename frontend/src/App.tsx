import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import OnboardingGuard from './shared/components/OnboardingGuard';
import PublicOnboardingGuard from './shared/components/PublicOnboardingGuard';
import GradientSpinnerAnimation from './shared/components/GradientSpinnerAnimation';

// Create a client
const queryClient = new QueryClient();

// Lazy load feature pages
const StartPage = React.lazy(() => import('./features/start/StartPage'));
const ChatPage = React.lazy(() => import('./features/chat/ChatPage'));
const RefinePage = React.lazy(() => import('./features/refine/RefinePage'));
const ExportPage = React.lazy(() => import('./features/export/ExportPage'));
const ResumesPage = React.lazy(() => import('./features/resumes/ResumesPage'));
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

function AppRoutes() {
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
        
        {/* Protected routes */}
        <Route path="/resumes" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <ResumesPage />
            </OnboardingGuard>
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
        <Route path="/export/success" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <PaymentSuccessPage />
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/" element={<HomeRedirect />} />
      </Routes>
    </React.Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
