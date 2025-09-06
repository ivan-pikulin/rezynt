import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingPage } from '../../features/onboarding';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuthContext();
  const { shouldShowOnboarding } = useOnboarding(user);

  // Show loading while checking authentication
  if (isLoading) {
    return null; // Or loading component
  }

  // If user is not authenticated, don't show onboarding
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If onboarding needs to be shown, show it
  if (shouldShowOnboarding) {
    return <OnboardingPage />;
  }

  // Otherwise show child components
  return <>{children}</>;
};

export default OnboardingGuard;
