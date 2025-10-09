import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../../shared/services/api';
import { SendMessageRequest, Message } from '../../../shared/services/api/types';
import { useUser } from '../../../shared/hooks/useUser';
import i18n from '../../../shared/i18n';

// Local chat message type for UI
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Message load types for scroll management
type MessageLoadType = 'initial' | 'older' | 'new' | 'none';

export const useChat = (resumeId: string | null, onResumeUpdate?: () => void, fromUpload: boolean = false, onShowPaywall?: () => void) => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const { t } = useTranslation();
  const [lastLoadType, setLastLoadType] = useState<MessageLoadType>('none');
  const [pendingScrollRestore, setPendingScrollRestore] = useState<any>(null);
  const [currentThinkingPhrase, setCurrentThinkingPhrase] = useState<string>('');
  const [shuffledPhrases, setShuffledPhrases] = useState<string[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);

  // List of phrases to show while waiting
  const thinkingPhrases = [
    t('thinking.phrases.0'),
    t('thinking.phrases.1'),
    t('thinking.phrases.2'),
    t('thinking.phrases.3'),
    t('thinking.phrases.4'),
    t('thinking.phrases.5'),
    t('thinking.phrases.6'),
    t('thinking.phrases.7'),
    t('thinking.phrases.8'),
    t('thinking.phrases.9'),
    t('thinking.phrases.10')
  ];

  // Function to shuffle array (Fisher-Yates algorithm)
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

  // Function to save scroll position
  const saveScrollPosition = useCallback(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      
      // Find first visible message
      const messageElements = container.querySelectorAll('[data-message-id]');
      let firstVisibleMessage = null;
      let firstVisibleMessageOffset = 0;
      
      for (const element of messageElements) {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // If message is visible (intersects with visible area)
        if (rect.bottom > containerRect.top && rect.top < containerRect.bottom) {
          firstVisibleMessage = element.getAttribute('data-message-id');
          firstVisibleMessageOffset = rect.top - containerRect.top;
          break;
        }
      }
      
      return {
        clientHeight,
        // Save position relative to bottom - this is more stable
        distanceFromBottom: scrollHeight - scrollTop - clientHeight,
        // Save information about first visible message
        firstVisibleMessage,
        firstVisibleMessageOffset
      };
    }
    return null;
  }, []);

  // Function to restore scroll position
  const restoreScrollPosition = useCallback((savedPosition: any) => {
    if (chatContainerRef.current && savedPosition) {
      const container = chatContainerRef.current;
      
      // Try to restore position relative to first visible message
      if (savedPosition.firstVisibleMessage) {
        const targetElement = container.querySelector(`[data-message-id="${savedPosition.firstVisibleMessage}"]`);
        if (targetElement) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const newOffset = targetRect.top - containerRect.top;
          
          // Adjust position with saved offset
          const correctedScrollTop = container.scrollTop + (newOffset - savedPosition.firstVisibleMessageOffset);
          
          container.scrollTop = Math.max(0, correctedScrollTop);
          return;
        }
      }
      
      // Fallback: use distance from bottom
      const newScrollTop = container.scrollHeight - savedPosition.distanceFromBottom - savedPosition.clientHeight;
      const finalScrollTop = Math.max(0, newScrollTop);
      
      // Check if position needs to be changed at all
      if (Math.abs(container.scrollTop - finalScrollTop) > 5) {
        container.scrollTop = finalScrollTop;
      }
    }
  }, []);

  const loadLatestMessages = useCallback(async () => {
    if (!resumeId) return;

    // Prevent reloading if messages are already loaded and we're not in initial load
    if (messages.length > 0 && lastLoadType !== 'none') {
      return;
    }

    // For unauthenticated users, show welcome message immediately without API call
    const currentUser = user; // Capture current user value
    if (!currentUser) {
      const welcomeMessage = {
        id: 'welcome',
        content: i18n.t('chat.welcomeMessages.guest'),
        sender: 'assistant' as const,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setHasMoreMessages(false);
      return;
    }

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
      let finalMessages = chatMessages.reverse();
      
      // Add welcome message if no messages exist
      if (finalMessages.length === 0) {
        // Check if there's a startup message in localStorage for uploaded resume
        const startupMessage = localStorage.getItem(`startup_message_${resumeId}`);
        let welcomeContent;
        
        if (startupMessage && fromUpload) {
          // Use startup message from AI for uploaded resume
          welcomeContent = startupMessage;
          // Remove message from localStorage after use
          localStorage.removeItem(`startup_message_${resumeId}`);
        } else {
          // Use standard greeting for authenticated users
          welcomeContent = fromUpload 
            ? i18n.t('chat.welcomeMessages.fromUpload')
            : i18n.t('chat.welcomeMessages.fromScratch');
        }
        
        const welcomeMessage = {
          id: 'welcome',
          content: welcomeContent,
          sender: 'assistant' as const,
          timestamp: new Date()
        };
        finalMessages = [welcomeMessage];
      }
      
      setMessages(finalMessages);
      setHasMoreMessages(response.has_more);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [resumeId, fromUpload, messages.length, lastLoadType]);

  // Scroll management depending on message load type
  useEffect(() => {
    // Scroll down only on initial load or sending new message
    if (lastLoadType === 'initial' || lastLoadType === 'new') {
      scrollToBottom();
    }
    // When loading older messages (lastLoadType === 'older') do nothing
    // position is already restored in loadOlderMessages
  }, [messages, lastLoadType, scrollToBottom]);

  // useLayoutEffect for synchronous scroll position restoration
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
      
      // Save scroll position AFTER receiving response, but BEFORE updating messages
      const savedPosition = saveScrollPosition();
      
      // Add older messages to the beginning
      setMessages(prev => [...chatMessages.reverse(), ...prev]);
      setHasMoreMessages(response.has_more);
      
      // Set flag to restore position in useLayoutEffect
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

    // Block unauthenticated users and show registration modal
    if (!user) {
      onShowPaywall?.();
      return;
    }

    // Check credits for free users
    if (!user?.is_premium && user?.credits === 0) {
      onShowPaywall?.();
      return;
    }

    // Set load type for new message
    setLastLoadType('new');

    // Optimistically decrement credits on frontend for free users
    let didOptimisticDecrement = false;
    if (!user?.is_premium && (user?.credits ?? 0) > 0) {
      queryClient.setQueryData(['user'], (prev: any) => {
        if (!prev) return prev;
        const nextCredits = Math.max(0, (prev.credits ?? 0) - 1);
        didOptimisticDecrement = true;
        return { ...prev, credits: nextCredits };
      });
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add placeholder assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      content: '',
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(true);
    
    // Shuffle phrases and reset index
    const newShuffledPhrases = shuffleArray(thinkingPhrases);
    setShuffledPhrases(newShuffledPhrases);
    setCurrentPhraseIndex(0);
    setCurrentThinkingPhrase(newShuffledPhrases[0] || t('thinking.phrases.0'));
    
    // Timer to change phrases every 4 seconds
    const phraseTimer = setInterval(() => {
      setCurrentPhraseIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % newShuffledPhrases.length;
        setCurrentThinkingPhrase(newShuffledPhrases[nextIndex]);
        return nextIndex;
      });
    }, 4000);
    
    try {
      // Send request to API with streaming
      const request: SendMessageRequest = {
        message: content,
        resume_id: resumeId
      };
      
      await chatApi.sendMessageStream(
        request,
        // onChunk callback - add chunk to assistant message
        (chunk: string) => {
          // Clear phrase timer when first chunk is received
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
        // onEnd callback - stream completion
        () => {
          clearInterval(phraseTimer);
          setIsLoading(false);
          
          // Update resume cache after AI response
          if (resumeId) {
            // Invalidate resume cache to get fresh data
            queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
          }
          
          // Call callback to update UI
          if (onResumeUpdate) {
            onResumeUpdate();
          }
        },
        // onError callback - error handling
        (error: string) => {
          clearInterval(phraseTimer);
          console.error('Chat streaming error:', error);
          
          // Check if error is related to credits
          if (error.includes('No credits remaining') || error.includes('402')) {
            onShowPaywall?.();
            // Remove user message and placeholder assistant message
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== assistantMessageId));
          } else {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: i18n.t('chat.errors.general') }
                  : msg
              )
            );
          }

          // Rollback optimistic decrement in case of error
          if (didOptimisticDecrement) {
            queryClient.setQueryData(['user'], (prev: any) => {
              if (!prev) return prev;
              return { ...prev, credits: (prev.credits ?? 0) + 1 };
            });
          }
          setIsLoading(false);
        }
      );
      
    } catch (error) {
      clearInterval(phraseTimer);
      console.error('Chat API error:', error);
      
      // Check if error is related to credits
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('No credits remaining') ||
        errorMessage.includes('402') ||
        errorMessage.includes('401')
      ) {
        onShowPaywall?.();
        // Remove user message and placeholder assistant message
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== assistantMessageId));
      } else {
        // In case of error show error message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: i18n.t('chat.errors.general') }
              : msg
          )
        );
      }

      // Rollback optimistic decrement in case of error
      if (didOptimisticDecrement) {
        queryClient.setQueryData(['user'], (prev: any) => {
          if (!prev) return prev;
          return { ...prev, credits: (prev.credits ?? 0) + 1 };
        });
      }
      setIsLoading(false);
    }
  }, [resumeId, onResumeUpdate, queryClient, user, onShowPaywall]);

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