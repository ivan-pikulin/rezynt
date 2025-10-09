import { useMemo } from 'react';
import { User } from '../services/api/types';

export const useOnboarding = (user: User | null) => {
  const shouldShowOnboarding = useMemo(() => {
    if (!user) return false;
    
    // Show onboarding only if:
    // 1. User is verified (confirmed email)
    // 2. Onboarding is not yet completed
    return user.is_verified && !user.has_completed_onboarding;
  }, [user]);

  return {
    shouldShowOnboarding,
    isOnboardingComplete: user?.has_completed_onboarding ?? false,
  };
};
