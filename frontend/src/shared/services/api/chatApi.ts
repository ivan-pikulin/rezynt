import { BaseApi } from './baseApi';
import { SendMessageRequest, SendMessageResponse, Message, MessageList } from './types';

export class ChatApi extends BaseApi {
  /**
   * Send message to chat
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.post<SendMessageResponse>('/chat/send-message', {
      message: data.message,
      resume_id: data.resume_id
    });
    
    return response;
  }

  /**
   * Get messages for a specific resume with offset-based pagination
   */
  async getMessages(
    resumeId: number, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<MessageList> {
    const params = { limit, offset };
    
    const response = await this.get<MessageList>(`/chat/messages/${resumeId}`, {
      params
    });
    
    return response;
  }

  /**
   * Get latest messages for a specific resume (for initial chat load)
   */
  async getLatestMessages(resumeId: number, limit: number = 20): Promise<MessageList> {
    return this.getMessages(resumeId, limit, 0);
  }

  /**
   * Get older messages with offset pagination
   */
  async getOlderMessages(
    resumeId: number, 
    limit: number = 20,
    offset: number = 0
  ): Promise<MessageList> {
    return this.getMessages(resumeId, limit, offset);
  }
}

export const chatApi = new ChatApi();
