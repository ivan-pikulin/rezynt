/**
 * Resume data interfaces
 */

// Упрощенная структура опыта работы
export interface ResumeExperience {
  job_title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  responsibilities: string[];
}

// Упрощенная структура образования
export interface ResumeEducation {
  degree: string;
  institution: string;
  location?: string;
  graduation_date?: string;
}

// Основная структура ResumeData в соответствии с UnifiedResume
export interface ResumeData {
  // Основные поля резюме
  id?: number;
  user_id?: number;
  title?: string;
  template_id?: number;
  professional_summary?: string;
  conversation_id?: string;
  from_upload?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Персональная информация (плоская структура как в UnifiedResume)
  first_name?: string;
  last_name?: string;
  location?: string;
  
  // Контакты и навыки (массивы строк как в UnifiedResume)
  contacts: string[];
  skills: string[];
  
  // Опыт и образование (упрощенная структура)
  experience: ResumeExperience[];
  education: ResumeEducation[];
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