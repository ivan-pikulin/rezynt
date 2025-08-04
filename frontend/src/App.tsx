import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Create a client
const queryClient = new QueryClient();

// Lazy load feature pages
const StartPage = React.lazy(() => import('./features/start/StartPage'));
const ChatPage = React.lazy(() => import('./features/chat/ChatPage'));
const RefinePage = React.lazy(() => import('./features/refine/RefinePage'));
const ExportPage = React.lazy(() => import('./features/export/ExportPage'));

function AppRoutes() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/start" element={<StartPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/refine" element={<RefinePage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/" element={<StartPage />} />
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
