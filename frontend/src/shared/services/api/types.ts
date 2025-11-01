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
  first_name?: string;
  last_name?: string;
  is_verified: boolean;
  is_premium: boolean;
  is_registered: boolean;
  has_completed_onboarding: boolean;
  onboarding_responses?: {
    experience: string;
    job_search_status: string;
    background_field: string;
    resume_goal: string;
  };
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  temp_file_id?: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
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
  temp_file_id?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  task_id?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

// Resume types (new JSONB structure)
export interface Contacts {
  email?: string;
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
}

export interface PersonalInfo {
  first_name?: string;
  last_name?: string;
  current_role?: string;
  city?: string;
  country?: string;
  photo_url?: string;
  contacts?: Contacts;
}

export interface WorkExperience {
  job_title?: string;
  company?: string;
  short_description?: string;
  city?: string;
  country?: string;
  start_date?: string; // Format: "Month YYYY" or "YYYY-MM-DD"
  end_date?: string; // Format: "Month YYYY" or "YYYY-MM-DD" or null for current
  responsibilities?: string[];
  achievements?: string[];
  technologies_tools?: string[];
}

export interface Education {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  city?: string;
  country?: string;
  start_date?: string; // Format: "Month YYYY"
  end_date?: string; // Format: "Month YYYY"
  relevant_courses?: string[];
}

export interface Language {
  language?: string;
  proficiency?: string; // e.g., "Native", "Fluent", "Intermediate", "Basic"
}

export interface Award {
  title?: string;
  issuer?: string;
  date?: string; // Format: "Month YYYY"
  description?: string;
}

export interface Resume {
  personal_info?: PersonalInfo;
  professional_summary?: string;
  skills?: string[];
  work_experience?: WorkExperience[];
  education?: Education[];
  languages_spoken?: Language[];
  awards?: Award[];
}

export interface ResumeUpdate {
  personal_info?: PersonalInfo;
  professional_summary?: string;
  skills?: string[];
  work_experience?: WorkExperience[];
  education?: Education[];
  languages_spoken?: Language[];
  awards?: Award[];
}

// PDF Export types
export interface PDFExportRequest {
  html_content?: string;
  filename?: string;
  template_slug?: string; // Options: nume, luma, alto, vero
}

// Chat types
export interface ChatMessage {
  id: string;
  role: string; // "user" or "assistant"
  content: string;
  created_at: number; // timestamp
  conversation_id?: string;
}

export interface ChatMessageList {
  messages: ChatMessage[];
  has_more: boolean;
  limit: number;
}

// Onboarding types
export interface OnboardingResponse {
  experience: string;
  job_search_status: string;
  background_field: string;
  resume_goal: string;
}

// Task status types (for file upload)
export interface TaskStatus {
  state: string;
  status: string;
  message: string;
  error?: string;
}
