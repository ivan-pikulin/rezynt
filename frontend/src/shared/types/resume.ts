/**
 * Resume data interfaces
 */

// Import types from API types for consistency
import { 
  WorkExperience as ApiWorkExperience,
  Education as ApiEducation,
  PersonalInfo as ApiPersonalInfo,
  Language,
  Award
} from '../services/api/types';

// Re-export for template usage
export type WorkExperience = ApiWorkExperience;
export type Education = ApiEducation;
export type PersonalInfo = ApiPersonalInfo;
export type { Language, Award };

// Main ResumeData structure matching new JSONB structure
export interface ResumeData {
  personal_info?: PersonalInfo;
  professional_summary?: string;
  skills?: string[];
  work_experience?: WorkExperience[];
  education?: Education[];
  languages_spoken?: Language[];
  awards?: Award[];
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative';
  isPremium?: boolean;
}

export interface ExportOptions {
  format: 'pdf' | 'png';
  quality?: number;
  filename?: string;
}
