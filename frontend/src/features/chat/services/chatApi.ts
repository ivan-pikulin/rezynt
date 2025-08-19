import baseApi from '../../../shared/services/api/baseApi';
import { SendMessageRequest, SendMessageResponse } from '../types/chat';

export const chatApi = {
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await baseApi.post('/chat/send-message', {
      message: data.message,
      resume_id: data.resumeId
    });
    
    return {
      message: response.data.response
    };
  }
}; 