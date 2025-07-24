import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { NotificationProvider } from 'shared/components/feedback/Notification';
import { AdminRoute } from './features/admin/routes';
import { ErrorBoundary, Layout, Loading } from './shared/components';
import { AppProvider } from './shared/context/AppContext';
import { HeaderProvider } from './shared/context/HeaderContext';
import { CustomThemeProvider } from './shared/theme/ThemeContext';

// Create a client
const queryClient = new QueryClient();

// Lazy load pages
const FamilyTree = React.lazy(() => import('./features/familyTree/pages/FamilyTree'));
const Login = React.lazy(() => import('./features/auth/pages/Login'));
const Signup = React.lazy(() => import('./features/auth/pages/Signup'));
const Photos = React.lazy(() => import('./features/photos/pages/Photos'));

function AppRoutes() {
  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/" element={<FamilyTree />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/admin" element={<AdminRoute />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <NotificationProvider>
          <CssBaseline />
          <AppProvider>
            <HeaderProvider>
              <QueryClientProvider client={queryClient}>
                <Router>
                  <AppRoutes />
                </Router>
              </QueryClientProvider>
            </HeaderProvider>
          </AppProvider>
        </NotificationProvider>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
