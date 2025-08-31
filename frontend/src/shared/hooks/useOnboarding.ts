import { useMemo } from 'react';
import { User } from '../services/api/types';

export const useOnboarding = (user: User | null) => {
  const shouldShowOnboarding = useMemo(() => {
    if (!user) return false;
    
    // Показываем онбординг только если:
    // 1. Пользователь верифицирован (подтвердил email)
    // 2. Онбординг еще не завершен
    return user.is_verified && !user.has_completed_onboarding;
  }, [user]);

  return {
    shouldShowOnboarding,
    isOnboardingComplete: user?.has_completed_onboarding ?? false,
  };
};
