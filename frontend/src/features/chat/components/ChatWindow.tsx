import React from 'react';
import { Box } from '@mui/material';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';

const ChatWindow: React.FC = () => {
  const { messages, isLoading, sendUserMessage } = useChat();
  
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f8f9fa',
      border: '1px solid #1976d2',
      borderRadius: '4px',
      overflow: 'hidden', // Предотвращаем переполнение контейнера
      maxHeight: '100%' // Ограничиваем максимальную высоту
    }}>
      {/* Область чата с прокруткой */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        minHeight: 0, // Важно для правильной работы flex
        maxHeight: 'calc(100% - 88px)' // Резервируем место для поля ввода (минимальная высота)
      }}>
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLoading={isLoading}
          />
        ))}
      </Box>

      {/* Поле ввода - зафиксировано внизу */}
      <Box sx={{
        flexShrink: 0, // Предотвращаем сжатие
        borderTop: '1px solid #e8e8e8', // Более мягкая граница
        bgcolor: 'white',
        height: 'auto', // Автоматическая высота вместо фиксированной
        minHeight: '88px', // Увеличиваем минимальную высоту для кнопки
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)', // Мягкая тень сверху
        position: 'relative' // Для правильного позиционирования
      }}>
        <ChatInput onSendMessage={sendUserMessage} disabled={isLoading} />
      </Box>
    </Box>
  );
};

export default ChatWindow; 