export interface HeaderProps {
  activeStep?: number;
  onNext?: () => void;
  onBack?: () => void;
  onStepClick?: (stepIndex: number) => void; // Function for navigation by clicking on step
  allowFirstStepClick?: boolean; // Allow clicking on the first step (Start)
  disableStepsClick?: boolean; // Disable clicking on all steps (for unauthenticated users)
  nextButtonText?: string;
  previousButtonText?: string;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showLogo?: boolean;
  showSteps?: boolean; // Whether to show steps (default: true)
  
  // Props for pro users with tabs
  isProUser?: boolean;
  currentTab?: string;
  onTabChange?: (tab: 'resumes' | 'ai-writer' | 'editor' | 'build' | 'analyze' | 'export') => void;
  
  // Props for onboarding mode
  isOnboarding?: boolean;
  onboardingTitle?: string;
  
  // Props for builder mode with custom steps
  customSteps?: string[]; // Custom step labels (e.g., for builder)
  hideNavigationArrows?: boolean; // Hide < > navigation arrows
} 