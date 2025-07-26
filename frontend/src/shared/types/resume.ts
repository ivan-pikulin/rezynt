/**
 * Resume data interfaces
 */

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  email: string;
  location: string;
  zipCode?: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  fieldOfStudy?: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative';
}

export interface ExportOptions {
  format: 'pdf' | 'png';
  quality?: number;
  filename?: string;
} 