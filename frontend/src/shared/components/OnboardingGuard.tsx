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

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading) {
    return null; // Или компонент загрузки
  }

  // Если пользователь не аутентифицирован, не показываем онбординг
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Если нужно показать онбординг, показываем его
  if (shouldShowOnboarding) {
    return <OnboardingPage />;
  }

  // Иначе показываем дочерние компоненты
  return <>{children}</>;
};

export default OnboardingGuard;
