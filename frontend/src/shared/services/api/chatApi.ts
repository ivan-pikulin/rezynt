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
   * Get messages for a specific resume with cursor-based pagination
   */
  async getMessages(
    resumeId: number, 
    limit: number = 10, 
    cursor?: number,
    direction: 'backward' | 'forward' = 'backward'
  ): Promise<MessageList> {
    const params: any = { limit, direction };
    if (cursor !== undefined) {
      params.cursor = cursor;
    }
    
    const response = await this.get<MessageList>(`/chat/messages/${resumeId}`, {
      params
    });
    
    return response;
  }

  /**
   * Get latest messages for a specific resume (for initial chat load)
   */
  async getLatestMessages(resumeId: number, limit: number = 10): Promise<MessageList> {
    return this.getMessages(resumeId, limit);
  }

  /**
   * Get older messages before a specific message ID (for pagination when scrolling up)
   */
  async getOlderMessages(
    resumeId: number, 
    beforeMessageId: number, 
    limit: number = 10
  ): Promise<MessageList> {
    return this.getMessages(resumeId, limit, beforeMessageId, 'backward');
  }
}

export const chatApi = new ChatApi();
