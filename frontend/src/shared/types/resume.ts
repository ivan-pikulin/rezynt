/**
 * Resume data interfaces
 */

// Simplified work experience structure
export interface WorkExperience {
  job_title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  responsibilities: string[];
}

// Simplified education structure
export interface Education {
  degree: string;
  institution: string;
  location?: string;
  graduation_date?: string;
}

// Main ResumeData structure in accordance with UnifiedResume
export interface ResumeData {
  // Main resume fields
  id: number;
  user_id?: number;
  title?: string;
  template_slug?: string;
  professional_summary?: string;
  conversation_id?: string;
  from_upload?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Personal information (flat structure as in UnifiedResume)
  first_name?: string;
  last_name?: string;
  location?: string;
  professional_summary?: string;
  
  // Contacts and skills (string arrays as in UnifiedResume)
  contacts: string[];
  skills: string[];
  
  // Experience and education (simplified structure)
  experience: WorkExperience[];
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