import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../../../shared/services/api';
import { SendMessageRequest, Message } from '../../../shared/services/api/types';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadLatestMessages = useCallback(async () => {
    if (!resumeId) return;

    setIsLoadingMessages(true);
    try {
      const response = await chatApi.getLatestMessages(parseInt(resumeId), 10);
      const chatMessages = response.messages.map((msg: Message) => ({
        id: msg.id.toString(),
        content: msg.content,
        sender: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at)
      }));
      
      // Reverse messages to show in chronological order
      setMessages(chatMessages.reverse());
      setHasMoreMessages(response.has_more);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [resumeId]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load initial messages when resumeId changes
  useEffect(() => {
    if (resumeId) {
      loadLatestMessages();
    } else {
      setMessages([]);
    }
  }, [resumeId, loadLatestMessages]);

  const loadOlderMessages = useCallback(async () => {
    if (!resumeId || messages.length === 0 || !hasMoreMessages) return;

    const oldestMessageId = parseInt(messages[0].id);
    setIsLoadingMessages(true);
    
    try {
      const response = await chatApi.getOlderMessages(parseInt(resumeId), oldestMessageId, 10);
      const chatMessages = response.messages.map((msg: Message) => ({
        id: msg.id.toString(),
        content: msg.content,
        sender: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at)
      }));
      
      // Add older messages to the beginning
      setMessages(prev => [...chatMessages.reverse(), ...prev]);
      setHasMoreMessages(response.has_more);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [resumeId, messages, hasMoreMessages]);

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
  }, [resumeId, onResumeUpdate, queryClient]);

  return {
    messages,
    isLoading,
    isLoadingMessages,
    hasMoreMessages,
    sendUserMessage,
    loadOlderMessages,
    messagesEndRef
  };
}; 