import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
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

// Типы загрузки сообщений для управления скроллом
type MessageLoadType = 'initial' | 'older' | 'new' | 'none';

export const useChat = (resumeId: string | null, onResumeUpdate?: () => void) => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastLoadType, setLastLoadType] = useState<MessageLoadType>('none');
  const [pendingScrollRestore, setPendingScrollRestore] = useState<any>(null);
  const [currentThinkingPhrase, setCurrentThinkingPhrase] = useState<string>('Thinking');
  const [shuffledPhrases, setShuffledPhrases] = useState<string[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);

  // Список фраз для показа во время ожидания
  const thinkingPhrases = [
    'Thinking',
    'Analyzing your resume',
    'Processing your request',
    'Generating response',
    'Working on it',
    'Almost ready',
    'Preparing answer',
    'Weighing every word',
    'Putting thoughts in order',
    'Polishing the phrasing',
    'Structuring the information'
  ];

  // Функция для перемешивания массива (алгоритм Fisher-Yates)
  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Функция для сохранения позиции скролла
  const saveScrollPosition = useCallback(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      
      // Находим первое видимое сообщение
      const messageElements = container.querySelectorAll('[data-message-id]');
      let firstVisibleMessage = null;
      let firstVisibleMessageOffset = 0;
      
      for (const element of messageElements) {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Если сообщение видимо (пересекается с видимой областью)
        if (rect.bottom > containerRect.top && rect.top < containerRect.bottom) {
          firstVisibleMessage = element.getAttribute('data-message-id');
          firstVisibleMessageOffset = rect.top - containerRect.top;
          break;
        }
      }
      
      return {
        clientHeight,
        // Сохраняем позицию относительно конца - это более стабильно
        distanceFromBottom: scrollHeight - scrollTop - clientHeight,
        // Сохраняем информацию о первом видимом сообщении
        firstVisibleMessage,
        firstVisibleMessageOffset
      };
    }
    return null;
  }, []);

  // Функция для восстановления позиции скролла
  const restoreScrollPosition = useCallback((savedPosition: any) => {
    if (chatContainerRef.current && savedPosition) {
      const container = chatContainerRef.current;
      
      // Пробуем восстановить позицию относительно первого видимого сообщения
      if (savedPosition.firstVisibleMessage) {
        const targetElement = container.querySelector(`[data-message-id="${savedPosition.firstVisibleMessage}"]`);
        if (targetElement) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const newOffset = targetRect.top - containerRect.top;
          
          // Корректируем позицию с учетом сохраненного смещения
          const correctedScrollTop = container.scrollTop + (newOffset - savedPosition.firstVisibleMessageOffset);
          
          container.scrollTop = Math.max(0, correctedScrollTop);
          return;
        }
      }
      
      // Fallback: используем расстояние от низа
      const newScrollTop = container.scrollHeight - savedPosition.distanceFromBottom - savedPosition.clientHeight;
      const finalScrollTop = Math.max(0, newScrollTop);
      
      // Проверяем, нужно ли вообще менять позицию
      if (Math.abs(container.scrollTop - finalScrollTop) > 5) {
        container.scrollTop = finalScrollTop;
      }
    }
  }, []);

  const loadLatestMessages = useCallback(async () => {
    if (!resumeId) return;

    setIsLoadingMessages(true);
    setLastLoadType('initial');
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

  // Управление скроллом в зависимости от типа загрузки сообщений
  useEffect(() => {
    // Прокручиваем вниз только при первой загрузке или отправке нового сообщения
    if (lastLoadType === 'initial' || lastLoadType === 'new') {
      scrollToBottom();
    }
    // При загрузке старых сообщений (lastLoadType === 'older') ничего не делаем
    // позиция уже восстановлена в loadOlderMessages
  }, [messages, lastLoadType, scrollToBottom]);

  // useLayoutEffect для синхронного восстановления позиции скролла
  useLayoutEffect(() => {
    if (pendingScrollRestore) {
      restoreScrollPosition(pendingScrollRestore);
      setPendingScrollRestore(null);
    }
  }, [messages, pendingScrollRestore, restoreScrollPosition]);

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
    setLastLoadType('older');
    
    try {
      const response = await chatApi.getOlderMessages(parseInt(resumeId), oldestMessageId, 10);
      const chatMessages = response.messages.map((msg: Message) => ({
        id: msg.id.toString(),
        content: msg.content,
        sender: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at)
      }));
      
      // Сохраняем позицию скролла ПОСЛЕ получения ответа, но ДО обновления сообщений
      const savedPosition = saveScrollPosition();
      
      // Add older messages to the beginning
      setMessages(prev => [...chatMessages.reverse(), ...prev]);
      setHasMoreMessages(response.has_more);
      
      // Устанавливаем флаг для восстановления позиции в useLayoutEffect
      setPendingScrollRestore(savedPosition);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [resumeId, messages, hasMoreMessages, saveScrollPosition, restoreScrollPosition]);

  const sendUserMessage = useCallback(async (content: string) => {
    if (!resumeId) {
      console.error('Resume ID is required');
      return;
    }

    // Устанавливаем тип загрузки для нового сообщения
    setLastLoadType('new');

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
    
    // Перемешиваем фразы и сбрасываем индекс
    const newShuffledPhrases = shuffleArray(thinkingPhrases);
    setShuffledPhrases(newShuffledPhrases);
    setCurrentPhraseIndex(0);
    setCurrentThinkingPhrase(newShuffledPhrases[0] || 'Thinking');
    
    // Таймер для смены фраз каждые 4 секунды
    const phraseTimer = setInterval(() => {
      setCurrentPhraseIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % newShuffledPhrases.length;
        setCurrentThinkingPhrase(newShuffledPhrases[nextIndex]);
        return nextIndex;
      });
    }, 4000);
    
    try {
      // Отправляем запрос на API с streaming
      const request: SendMessageRequest = {
        message: content,
        resume_id: resumeId
      };
      
      await chatApi.sendMessageStream(
        request,
        // onChunk callback - добавляем чанк к сообщению ассистента
        (chunk: string) => {
          // Очищаем таймер смены фраз при получении первого чанка
          clearInterval(phraseTimer);
          
          flushSync(() => {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          });
        },
        // onEnd callback - завершение стрима
        () => {
          clearInterval(phraseTimer);
          setIsLoading(false);
          
          // Обновляем кеш резюме после ответа AI
          if (resumeId) {
            // Инвалидируем кеш резюме, чтобы получить свежие данные
            queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
          }
          
          // Вызываем callback для обновления UI
          if (onResumeUpdate) {
            onResumeUpdate();
          }
        },
        // onError callback - обработка ошибок
        (error: string) => {
          clearInterval(phraseTimer);
          console.error('Chat streaming error:', error);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
                : msg
            )
          );
          setIsLoading(false);
        }
      );
      
    } catch (error) {
      clearInterval(phraseTimer);
      console.error('Chat API error:', error);
      // В случае ошибки показываем сообщение об ошибке
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
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
    messagesEndRef,
    chatContainerRef,
    currentThinkingPhrase
  };
}; 