// Common types
export interface ApiResponse<T> {
  data: T;
  message?: string;
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

// Resume types
export interface Resume {
  id: number;
  title: string;
  template_id: number;
  user_id: number;
  professional_summary?: string;
  conversation_id?: string;
  created_at: string;
  updated_at: string;
  personal_info?: ResumePersonalInfo;
  contacts?: ResumeContact[];
  skills?: ResumeSkill[];
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  languages?: ResumeLanguage[];
  references?: ResumeReference[];
  volunteer?: ResumeVolunteer[];
  awards?: ResumeAward[];
  publications?: ResumePublication[];
  patents?: ResumePatent[];
  courses?: ResumeCourse[];
  test_scores?: ResumeTestScore[];
  hobbies?: ResumeHobby[];
  custom_sections?: ResumeCustomSection[];
}

export interface ResumeList {
  id: number;
  title: string;
  template_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeCreate {
  title: string;
  template_id: number;
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
  personal_info?: ResumePersonalInfoUpdate;
}

// Personal Info
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

// Contacts
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

// Skills
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

// Experience
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

// Education
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

// Projects
export interface ResumeProject {
  id: string;
  resume_id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  start_date?: string;
  end_date?: string;
  order: number;
}

export interface ResumeProjectCreate {
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  start_date?: string;
  end_date?: string;
}

export interface ResumeProjectUpdate {
  name?: string;
  description?: string;
  url?: string;
  technologies?: string[];
  start_date?: string;
  end_date?: string;
}

// Certifications
export interface ResumeCertification {
  id: string;
  resume_id: string;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  url?: string;
  order: number;
}

export interface ResumeCertificationCreate {
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  url?: string;
}

export interface ResumeCertificationUpdate {
  name?: string;
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  url?: string;
}

// Languages
export interface ResumeLanguage {
  id: string;
  resume_id: string;
  language: string;
  proficiency: string;
  order: number;
}

export interface ResumeLanguageCreate {
  language: string;
  proficiency: string;
}

export interface ResumeLanguageUpdate {
  language?: string;
  proficiency?: string;
}

// References
export interface ResumeReference {
  id: string;
  resume_id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  order: number;
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

// Volunteer
export interface ResumeVolunteer {
  id: string;
  resume_id: string;
  organization: string;
  role: string;
  start_date?: string;
  end_date?: string;
  description: string[];
  order: number;
}

export interface ResumeVolunteerCreate {
  organization: string;
  role: string;
  start_date?: string;
  end_date?: string;
  description: string[];
}

export interface ResumeVolunteerUpdate {
  organization?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  description?: string[];
}

// Awards
export interface ResumeAward {
  id: string;
  resume_id: string;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  description?: string;
  order: number;
}

export interface ResumeAwardCreate {
  name: string;
  issuing_organization: string;
  issue_date?: string;
  description?: string;
}

export interface ResumeAwardUpdate {
  name?: string;
  issuing_organization?: string;
  issue_date?: string;
  description?: string;
}

// Publications
export interface ResumePublication {
  id: string;
  resume_id: string;
  title: string;
  authors: string;
  journal?: string;
  publication_date?: string;
  url?: string;
  order: number;
}

export interface ResumePublicationCreate {
  title: string;
  authors: string;
  journal?: string;
  publication_date?: string;
  url?: string;
}

export interface ResumePublicationUpdate {
  title?: string;
  authors?: string;
  journal?: string;
  publication_date?: string;
  url?: string;
}

// Patents
export interface ResumePatent {
  id: string;
  resume_id: string;
  title: string;
  patent_number: string;
  issue_date?: string;
  description?: string;
  order: number;
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

// Courses
export interface ResumeCourse {
  id: string;
  resume_id: string;
  name: string;
  institution: string;
  completion_date?: string;
  description?: string;
  order: number;
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

// Test Scores
export interface ResumeTestScore {
  id: string;
  resume_id: string;
  test_name: string;
  score: string;
  test_date?: string;
  order: number;
}

export interface ResumeTestScoreCreate {
  test_name: string;
  score: string;
  test_date?: string;
}

export interface ResumeTestScoreUpdate {
  test_name?: string;
  score?: string;
  test_date?: string;
}

// Hobbies
export interface ResumeHobby {
  id: string;
  resume_id: string;
  name: string;
  description?: string;
  order: number;
}

export interface ResumeHobbyCreate {
  name: string;
  description?: string;
}

export interface ResumeHobbyUpdate {
  name?: string;
  description?: string;
}

// Custom Sections
export interface ResumeCustomSection {
  id: string;
  resume_id: string;
  title: string;
  content: string;
  order: number;
}

export interface ResumeCustomSectionCreate {
  title: string;
  content: string;
}

export interface ResumeCustomSectionUpdate {
  title?: string;
  content?: string;
}

// Export
export interface ResumeExportCreate {
  export_format: string;
  file_size: number;
  export_settings: Record<string, any>;
}

// Template types
export interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreate {
  name: string;
  slug: string;
  description?: string;
  is_premium: boolean;
}

export interface TemplateUpdate {
  name?: string;
  slug?: string;
  description?: string;
  is_premium?: boolean;
}

// Chat types
export interface SendMessageRequest {
  message: string;
  resume_id: string;
}

export interface SendMessageResponse {
  message: string;
  response: string;
  conversation_id: string;
}

// Refine types
export interface Suggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  action: string;
}

// Export types
export interface ExportPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface ExportResponse {
  success: boolean;
  planId: string;
  download_url?: string;
} 