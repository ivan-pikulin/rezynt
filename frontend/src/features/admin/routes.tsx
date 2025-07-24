import { RouteObject } from 'react-router-dom';
import React from 'react';
import AdminPage from './pages/AdminPage';
import { AccessDenied } from './components/AccessDenied';
import { useAuth } from '../auth/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loading } from 'shared/components';

const queryClient = new QueryClient();

export const AdminRoute: React.FC = () => {
  const { currentUser } = useAuth();
  return (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback={<Loading />}>
        {currentUser?.isAdmin ? <AdminPage /> : <AccessDenied />}
      </React.Suspense>
    </QueryClientProvider>
  );
};

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AdminRoute />,
  },
]; 