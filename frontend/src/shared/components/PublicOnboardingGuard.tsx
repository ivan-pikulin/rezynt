import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingPage } from '../../features/onboarding';

interface PublicOnboardingGuardProps {
  children: React.ReactNode;
}

const PublicOnboardingGuard: React.FC<PublicOnboardingGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuthContext();
  const { shouldShowOnboarding } = useOnboarding(user);
  const [searchParams] = useSearchParams();

  // Show loading while checking authentication
  if (isLoading) {
    return null; // Or loading component
  }

  // If user is authenticated and onboarding needs to be shown, show it with redirect URL
  if (user && shouldShowOnboarding) {
    return <OnboardingPage redirectUrl={searchParams.get('redirect') || undefined} />;
  }

  // Otherwise show child components (works for both authenticated and unauthenticated users)
  return <>{children}</>;
};

export default PublicOnboardingGuard;
