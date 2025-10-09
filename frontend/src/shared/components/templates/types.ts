import { ResumeData } from '../../types/resume';

export interface BaseTemplateProps {
  data: ResumeData;
  onExport?: () => void;
  isPreview?: boolean;
  scale?: number; // Add scale support
  t?: (key: string) => string; // Translation function
}
