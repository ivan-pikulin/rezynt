import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import OnboardingGuard from './shared/components/OnboardingGuard';

// Create a client
const queryClient = new QueryClient();

// Lazy load feature pages
const StartPage = React.lazy(() => import('./features/start/StartPage'));
const ChatPage = React.lazy(() => import('./features/chat/ChatPage'));
const RefinePage = React.lazy(() => import('./features/refine/RefinePage'));
const ExportPage = React.lazy(() => import('./features/export/ExportPage'));
const ResumesPage = React.lazy(() => import('./features/resumes/ResumesPage'));
const AuthPage = React.lazy(() => import('./features/auth/AuthPage'));
const EmailConfirmationPage = React.lazy(() => import('./features/auth/EmailConfirmationPage'));
const RequestPasswordResetPage = React.lazy(() => import('./features/auth/RequestPasswordResetPage'));
const ResetPasswordPage = React.lazy(() => import('./features/auth/ResetPasswordPage'));
const HomeRedirect = React.lazy(() => import('./shared/components/HomeRedirect'));

function AppRoutes() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={
          <ProtectedRoute requireAuth={false}>
            <AuthPage />
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false}>
            <AuthPage />
          </ProtectedRoute>
        } />
        <Route path="/auth/email-confirmed" element={<EmailConfirmationPage />} />
        <Route path="/auth/email-confirmation-error" element={<EmailConfirmationPage />} />
        <Route path="/auth/request-password-reset" element={<RequestPasswordResetPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected routes */}
        <Route path="/resumes" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <ResumesPage />
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/start" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <StartPage />
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <ChatPage />
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/refine" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <RefinePage />
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/export" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <ExportPage />
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute requireAuth={true}>
            <OnboardingGuard>
              <HomeRedirect />
            </OnboardingGuard>
          </ProtectedRoute>
        } />
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
