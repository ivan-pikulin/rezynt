import { SendMessageRequest, SendMessageResponse } from '../types/chat';

// Заглушка API - имитирует задержку сети
export const chatApi = {
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Заглушка ответа
    const responses = [
      "Thank you for sharing your experience! Can you tell me more about your technical skills?",
      "That's interesting! What programming languages are you most comfortable with?",
      "Great! How many years of experience do you have in this field?",
      "Perfect! What are your main achievements in your previous roles?",
      "Excellent! What kind of projects have you worked on recently?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: randomResponse
    };
  }
}; 