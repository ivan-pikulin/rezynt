import { useState, useCallback } from 'react';
import { chatApi } from '../../../shared/services/api';
import { SendMessageRequest } from '../../../shared/services/api/types';

// Local chat message type for UI
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const useChat = (resumeId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-1',
      content: 'Great! I can see you have impressive experience. Let me ask a few specific questions to help create your resume. What was your exact job title at SpaceX and how many years did you work there?',
      sender: 'assistant',
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: 'user-1',
      content: 'I was the CEO and Chief Engineer at SpaceX from 2002 to present',
      sender: 'user',
      timestamp: new Date(Date.now() - 240000) // 4 minutes ago
    },
    {
      id: 'assistant-2',
      content: 'Perfect! Now, what are the top 3 specific achievements you\'re most proud of at SpaceX? Please include numbers or metrics if possible.',
      sender: 'assistant',
      timestamp: new Date(Date.now() - 180000) // 3 minutes ago
    },
    {
      id: 'user-2',
      content: 'First successful landing of an orbital rocket booster in 2015, reducing launch costs by 90%, and successfully launching over 200 missions including crewed flights to ISS.',
      sender: 'user',
      timestamp: new Date(Date.now() - 120000) // 2 minutes ago
    },
    {
      id: 'assistant-3',
      content: 'Excellent! What specific technical skills and technologies did you use most frequently in your role? For example, programming languages, tools, or methodologies.',
      sender: 'assistant',
      timestamp: new Date(Date.now() - 60000) // 1 minute ago
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendUserMessage = useCallback(async (content: string) => {
    if (!resumeId) {
      console.error('Resume ID is required');
      return;
    }

    // Добавляем сообщение пользователя
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Добавляем placeholder сообщение ассистента
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      content: '',
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(true);
    
    try {
      // Отправляем запрос на API
      const request: SendMessageRequest = {
        message: content,
        resume_id: resumeId
      };
      
      const response = await chatApi.sendMessage(request);
      
      // Обновляем сообщение ассистента с реальным ответом
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: response.response }
            : msg
        )
      );
    } catch (error) {
      console.error('Chat API error:', error);
      // В случае ошибки показываем сообщение об ошибке
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  return {
    messages,
    isLoading,
    sendUserMessage
  };
}; 