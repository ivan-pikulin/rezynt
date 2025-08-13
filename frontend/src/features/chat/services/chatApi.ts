import { SendMessageRequest, SendMessageResponse } from '../types/chat';

// Заглушка API - имитирует задержку сети
export const chatApi = {
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Заглушка ответа
    const responses = [
      "What was your exact job title at Tesla and what years did you work there?",
      "What are the top 3 specific achievements you're most proud of at Tesla? Include numbers if possible.",
      "What specific technical skills and technologies did you use most frequently in your role?",
      "What was the size of the team you managed and what was your leadership style?",
      "What specific challenges did you overcome and how did you solve them?",
      "What was your biggest project and what was the outcome? Include metrics if possible.",
      "What specific tools, software, or methodologies did you use daily?",
      "What was your exact role in the development of specific products or features?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: randomResponse
    };
  }
}; 