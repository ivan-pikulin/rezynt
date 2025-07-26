import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Create a client
const queryClient = new QueryClient();

// Lazy load new feature pages
const PreviewPage = React.lazy(() => import('./features/preview/pages/PreviewPage'));
const ExportPage = React.lazy(() => import('./features/export/pages/ExportPage'));
const MainDialogPage = React.lazy(() => import('./features/chat/pages/MainDialogPage'));

function AppRoutes() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/" element={<MainDialogPage />} />
      </Routes>
    </React.Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
                <CssBaseline />
                <Router>
                  <AppRoutes />
                </Router>
    </QueryClientProvider>
  );
}

export default App;
