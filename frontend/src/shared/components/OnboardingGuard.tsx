import React, { useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingPage } from '../../features/onboarding';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuthContext();
  const { shouldShowOnboarding } = useOnboarding(user);
  const [searchParams] = useSearchParams();

  // Memoize the redirect URL to prevent unnecessary re-renders
  const redirectUrl = useMemo(() => {
    return searchParams.get('redirect') || undefined;
  }, [searchParams]);

  // Show loading while checking authentication
  if (isLoading) {
    return null; // Or loading component
  }

  // If user is not authenticated, don't show onboarding
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If onboarding needs to be shown, show it with redirect URL
  if (shouldShowOnboarding) {
    return <OnboardingPage redirectUrl={redirectUrl} />;
  }

  // Otherwise show child components
  return <>{children}</>;
};

export default OnboardingGuard;
