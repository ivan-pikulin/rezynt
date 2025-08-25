// Common types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ExportResponse {
  success: boolean;
  planId: 'pro' | 'lifetime';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// User types
export interface User {
  id: number;
  email: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
}

export interface UserPremiumUpdate {
  is_premium: boolean;
}

// Auth types
export interface LoginCredentials {
  username: string; // email
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

// Unified Resume types (new structure)
export interface UnifiedResume {
  id: number;
  user_id: number;
  title: string;
  template_id?: number;
  professional_summary?: string;
  conversation_id?: string;
  created_at: string;
  updated_at: string;
  
  // Personal info (flattened)
  first_name?: string;
  last_name?: string;
  location?: string;
  
  // Contacts and skills (simplified arrays)
  contacts: string[];
  skills: string[];
  
  // Experience and education (simplified)
  experience: UnifiedResumeExperience[];
  education: UnifiedResumeEducation[];
}

export interface UnifiedResumeExperience {
  job_title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  responsibilities: string[];
}

export interface UnifiedResumeEducation {
  degree: string;
  institution: string;
  location?: string;
  graduation_date?: string;
}

// Resume types (using UnifiedResume as base)
export interface Resume extends UnifiedResume {}

export interface ResumeList {
  id: number;
  title: string;
  template_id?: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeCreate {
  title: string;
  template_id?: number;
  professional_summary?: string;
}

export interface ResumeUpdate {
  title?: string;
  template_id?: number;
  professional_summary?: string;
  conversation_id?: string;
}

export interface ResumePartialUpdate {
  title?: string;
  template_id?: number;
  professional_summary?: string;
  conversation_id?: string;
  
  // UnifiedResume fields
  first_name?: string;
  last_name?: string;
  location?: string;
  contacts?: string[];
  skills?: string[];
  experience?: UnifiedResumeExperience[];
  education?: UnifiedResumeEducation[];
}

// Legacy types for API compatibility (simplified)
export interface ResumePersonalInfo {
  id: number;
  resume_id: number;
  first_name: string;
  last_name: string;
  location?: string;
}

export interface ResumePersonalInfoUpdate {
  first_name?: string;
  last_name?: string;
  location?: string;
}

export interface ResumeContact {
  id: number;
  resume_id: number;
  value: string;
}

export interface ResumeContactCreate {
  value: string;
}

export interface ResumeContactUpdate {
  value?: string;
}

export interface ResumeSkill {
  id: number;
  resume_id: number;
  name: string;
}

export interface ResumeSkillCreate {
  name: string;
}

export interface ResumeSkillUpdate {
  name?: string;
}

export interface ResumeExperience {
  id: number;
  resume_id: number;
  job_title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  responsibilities: string[];
}

export interface ResumeExperienceCreate {
  job_title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  responsibilities: string[];
}

export interface ResumeExperienceUpdate {
  job_title?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  responsibilities?: string[];
}

export interface ResumeEducation {
  id: number;
  resume_id: number;
  degree: string;
  institution: string;
  location?: string;
  graduation_date?: string;
  gpa?: number;
}

export interface ResumeEducationCreate {
  degree: string;
  institution: string;
  location?: string;
  graduation_date?: string;
  gpa?: number;
}

export interface ResumeEducationUpdate {
  degree?: string;
  institution?: string;
  location?: string;
  graduation_date?: string;
  gpa?: number;
}

// Project types
export interface ResumeProject {
  id: number;
  resume_id: number;
  title: string;
  description: string;
  url?: string;
  technologies: string[];
  start_date?: string;
  end_date?: string;
}

export interface ResumeProjectCreate {
  title: string;
  description: string;
  url?: string;
  technologies: string[];
  start_date?: string;
  end_date?: string;
}

export interface ResumeProjectUpdate {
  title?: string;
  description?: string;
  url?: string;
  technologies?: string[];
  start_date?: string;
  end_date?: string;
}

// Certification types
export interface ResumeCertification {
  id: number;
  resume_id: number;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface ResumeCertificationCreate {
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface ResumeCertificationUpdate {
  name?: string;
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

// Language types
export interface ResumeLanguage {
  id: number;
  resume_id: number;
  language: string;
  proficiency: string;
}

export interface ResumeLanguageCreate {
  language: string;
  proficiency: string;
}

export interface ResumeLanguageUpdate {
  language?: string;
  proficiency?: string;
}

// Reference types
export interface ResumeReference {
  id: number;
  resume_id: number;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
}

export interface ResumeReferenceCreate {
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
}

export interface ResumeReferenceUpdate {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
}

// Volunteer types
export interface ResumeVolunteer {
  id: number;
  resume_id: number;
  organization: string;
  role: string;
  description: string;
  start_date?: string;
  end_date?: string;
}

export interface ResumeVolunteerCreate {
  organization: string;
  role: string;
  description: string;
  start_date?: string;
  end_date?: string;
}

export interface ResumeVolunteerUpdate {
  organization?: string;
  role?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

// Award types
export interface ResumeAward {
  id: number;
  resume_id: number;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
}

export interface ResumeAwardCreate {
  title: string;
  issuer: string;
  date?: string;
  description?: string;
}

export interface ResumeAwardUpdate {
  title?: string;
  issuer?: string;
  date?: string;
  description?: string;
}

// Publication types
export interface ResumePublication {
  id: number;
  resume_id: number;
  title: string;
  authors: string[];
  journal?: string;
  publication_date?: string;
  url?: string;
}

export interface ResumePublicationCreate {
  title: string;
  authors: string[];
  journal?: string;
  publication_date?: string;
  url?: string;
}

export interface ResumePublicationUpdate {
  title?: string;
  authors?: string[];
  journal?: string;
  publication_date?: string;
  url?: string;
}

// Patent types
export interface ResumePatent {
  id: number;
  resume_id: number;
  title: string;
  patent_number: string;
  issue_date?: string;
  description?: string;
}

export interface ResumePatentCreate {
  title: string;
  patent_number: string;
  issue_date?: string;
  description?: string;
}

export interface ResumePatentUpdate {
  title?: string;
  patent_number?: string;
  issue_date?: string;
  description?: string;
}

// Course types
export interface ResumeCourse {
  id: number;
  resume_id: number;
  name: string;
  institution: string;
  completion_date?: string;
  description?: string;
}

export interface ResumeCourseCreate {
  name: string;
  institution: string;
  completion_date?: string;
  description?: string;
}

export interface ResumeCourseUpdate {
  name?: string;
  institution?: string;
  completion_date?: string;
  description?: string;
}

// Test Score types
export interface ResumeTestScore {
  id: number;
  resume_id: number;
  test_name: string;
  score: string;
  test_date?: string;
  description?: string;
}

export interface ResumeTestScoreCreate {
  test_name: string;
  score: string;
  test_date?: string;
  description?: string;
}

export interface ResumeTestScoreUpdate {
  test_name?: string;
  score?: string;
  test_date?: string;
  description?: string;
}

// Hobby types
export interface ResumeHobby {
  id: number;
  resume_id: number;
  name: string;
  description?: string;
}

export interface ResumeHobbyCreate {
  name: string;
  description?: string;
}

export interface ResumeHobbyUpdate {
  name?: string;
  description?: string;
}

// Custom Section types
export interface ResumeCustomSection {
  id: number;
  resume_id: number;
  title: string;
  content: string;
  order: number;
}

export interface ResumeCustomSectionCreate {
  title: string;
  content: string;
  order: number;
}

export interface ResumeCustomSectionUpdate {
  title?: string;
  content?: string;
  order?: number;
}

// Export types
export interface ResumeExport {
  id: number;
  resume_id: number;
  format: string;
  status: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeExportCreate {
  format: string;
  status: string;
  file_path?: string;
}

export interface ResumeExportUpdate {
  format?: string;
  status?: string;
  file_path?: string;
}

// Template types
export interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreate {
  name: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  is_active?: boolean;
}

export interface TemplateUpdate {
  name?: string;
  slug?: string;
  description?: string;
  thumbnail_url?: string;
  is_active?: boolean;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  resume_id: number;
  conversation_id?: string;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  download_url?: string;
}

// Chat API types
export interface SendMessageRequest {
  message: string;
  resume_id: string;
}

export interface SendMessageResponse {
  response: string;
  conversation_id?: string;
} 