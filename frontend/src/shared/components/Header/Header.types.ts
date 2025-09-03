export interface HeaderProps {
  activeStep?: number;
  onNext?: () => void;
  onBack?: () => void;
  onStepClick?: (stepIndex: number) => void; // Function for navigation by clicking on step
  nextButtonText?: string;
  previousButtonText?: string;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showLogo?: boolean;
  showSteps?: boolean; // Whether to show steps (default: true)
  
  // Props for pro users with tabs
  isProUser?: boolean;
  currentTab?: string;
  onTabChange?: (tab: 'resumes' | 'ai-writer' | 'editor') => void;
  
  // Props for onboarding mode
  isOnboarding?: boolean;
  onboardingTitle?: string;
} 