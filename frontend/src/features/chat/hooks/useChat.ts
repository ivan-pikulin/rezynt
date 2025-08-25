import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../../../shared/services/api';
import { SendMessageRequest } from '../../../shared/services/api/types';

// Local chat message type for UI
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const useChat = (resumeId: string | null, onResumeUpdate?: () => void) => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-1',
      content: 'Welcome aboard! I\'m your AI Resume Builder, here to save you time and boost your chances. Let\'s get personal: what\'s your name?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
      
      // Обновляем кеш резюме после ответа AI
      if (resumeId) {
        // Инвалидируем кеш резюме, чтобы получить свежие данные
        queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      }
      
      // Вызываем callback для обновления UI
      if (onResumeUpdate) {
        onResumeUpdate();
      }
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
    sendUserMessage,
    messagesEndRef
  };
}; 