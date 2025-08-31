export interface HeaderProps {
  activeStep?: number;
  onNext?: () => void;
  onBack?: () => void;
  onStepClick?: (stepIndex: number) => void; // Функция для навигации по клику на шаг
  nextButtonText?: string;
  previousButtonText?: string;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showLogo?: boolean;
  showSteps?: boolean; // Показывать ли шаги (по умолчанию true)
  
  // Props for pro users with tabs
  isProUser?: boolean;
  currentTab?: string;
  onTabChange?: (tab: 'resumes' | 'ai-writer' | 'editor') => void;
  
  // Props for onboarding mode
  isOnboarding?: boolean;
  onboardingTitle?: string;
} 