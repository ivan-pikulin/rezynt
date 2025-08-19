export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface SendMessageRequest {
  message: string;
  resumeId: string;
}

export interface SendMessageResponse {
  message: string;
} 