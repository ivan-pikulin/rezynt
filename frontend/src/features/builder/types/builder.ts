import { ResumeData } from '../../../shared/types/resume';

export type BuilderStep = 
  | 'contact-info'
  | 'work-experience'
  | 'education'
  | 'skills'
  | 'summary';

export interface BuilderStepConfig {
  id: BuilderStep;
  label: string;
  order: number;
}

export interface BuilderState extends ResumeData {
  currentStep: BuilderStep;
  completedSteps: BuilderStep[];
}

export const BUILDER_STEPS: BuilderStepConfig[] = [
  { id: 'contact-info', label: 'Contact Info', order: 0 },
  { id: 'work-experience', label: 'Work Experience', order: 1 },
  { id: 'education', label: 'Education', order: 2 },
  { id: 'skills', label: 'Skills', order: 3 },
  { id: 'summary', label: 'Summary', order: 4 },
];

