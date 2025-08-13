export interface HeaderProps {
  activeStep: number;
  onNext?: () => void;
  onBack?: () => void;
  nextButtonText?: string;
  previousButtonText?: string;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showLogo?: boolean;
} 