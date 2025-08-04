import { ResumeData } from '../../types/resume';

export interface BaseTemplateProps {
  data: ResumeData;
  onExport?: () => void;
  isPreview?: boolean;
}

export interface TemplateMethods {
  exportToPDF: () => Promise<void>;
  exportToPNG: () => Promise<string>;
} 