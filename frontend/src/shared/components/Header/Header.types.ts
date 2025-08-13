export interface HeaderProps {
  activeStep: number;
  onNext?: () => void;
  onBack?: () => void;
  onStepClick?: (stepIndex: number) => void; // Функция для навигации по клику на шаг
  nextButtonText?: string;
  previousButtonText?: string;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showLogo?: boolean;
} 