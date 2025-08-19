export interface UserLogin {
    username: string;
    password: string;
}

export interface UserSignup {
    username: string;
    password: string;
}

export interface UserFromApi {
    id: number;
    username: string;
    is_admin: boolean;
    last_login: string | null;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface UploadResponse {
  id: string;
  title: string;
  template_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
  id: string;
}

export interface ChatHistory {
  id: string;
  messages: ChatResponse[];
  createdAt: string;
}

export interface Suggestion {
  id: string;
  text: string;
  type: 'skill' | 'experience' | 'summary';
  confidence: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
}

export interface DownloadResponse {
  success: boolean;
  downloadUrl: string;
  message?: string;
} 