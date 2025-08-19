import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient();

// Lazy load feature pages
const StartPage = React.lazy(() => import('./features/start/StartPage'));
const ChatPage = React.lazy(() => import('./features/chat/ChatPage'));
const RefinePage = React.lazy(() => import('./features/refine/RefinePage'));
const ExportPage = React.lazy(() => import('./features/export/ExportPage'));
const AuthPage = React.lazy(() => import('./features/auth/AuthPage'));
const EmailConfirmationPage = React.lazy(() => import('./features/auth/EmailConfirmationPage'));

function AppRoutes() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Публичные маршруты */}
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
        
        {/* Защищенные маршруты */}
        <Route path="/start" element={
          <ProtectedRoute requireAuth={true}>
            <StartPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute requireAuth={true}>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/refine" element={
          <ProtectedRoute requireAuth={true}>
            <RefinePage />
          </ProtectedRoute>
        } />
        <Route path="/export" element={
          <ProtectedRoute requireAuth={true}>
            <ExportPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute requireAuth={true}>
            <StartPage />
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
