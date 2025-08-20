import { BaseApi } from './baseApi';
import { SendMessageRequest, SendMessageResponse } from './types';

export class ChatApi extends BaseApi {
  /**
   * Send message to chat
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.post<SendMessageResponse>('/chat/send-message', {
      message: data.message,
      resume_id: data.resume_id
    });
    
    return {
      message: response.response
    };
  }
}

export const chatApi = new ChatApi();
