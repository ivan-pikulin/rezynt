import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { ChatMessage as ChatMessageType } from '../hooks/useChat';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
}

// Компонент для анимированных точек
const AnimatedDots: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {[0, 1, 2].map((index) => (
      <Box
        key={index}
        sx={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'currentColor',
          animation: 'dotPulse 1.4s infinite ease-in-out',
          animationDelay: `${index * 0.2}s`,
          '@keyframes dotPulse': {
            '0%, 80%, 100%': {
              opacity: 0.3,
              transform: 'scale(0.8)'
            },
            '40%': {
              opacity: 1,
              transform: 'scale(1)'
            }
          }
        }}
      />
    ))}
  </Box>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.sender === 'user';
  const showLoading = isLoading && !isUser && !message.content;
  
  // Добавляем логи для отладки
  console.log('ChatMessage debug:', {
    messageId: message.id,
    sender: message.sender,
    role: (message as any).role, // Проверяем, есть ли поле role
    content: message.content,
    isUser: isUser,
    messageKeys: Object.keys(message)
  });
  
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 1, 
      alignItems: 'flex-start',
      justifyContent: isUser ? 'flex-end' : 'flex-start'
    }}>
      {!isUser && (
        <Avatar sx={{ 
          width: 36, // Увеличиваем с 32 до 36
          height: 36, // Увеличиваем с 32 до 36
          bgcolor: '#4a5899', // Синий цвет для бота
          fontSize: '1rem' // Увеличиваем с 0.875rem до 1rem
        }}>
          A
        </Avatar>
      )}
      
      <Box sx={{ 
        bgcolor: isUser ? '#4a5899' : '#e3f2fd', // Синий для пользователя, голубой для бота
        color: isUser ? 'white' : '#1976d2', // Белый текст для пользователя, синий для бота
        p: 1.5,
        borderRadius: '8px',
        maxWidth: '70%',
        fontSize: '1rem', // Увеличиваем с 0.875rem до 1rem
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: '24px'
      }}>
        {showLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: '1rem' }}> {/* Увеличиваем с 0.875rem до 1rem */}
              Thinking
            </Typography>
            <AnimatedDots />
          </Box>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '1rem' }}> {/* Увеличиваем с 0.875rem до 1rem */}
            {message.content}
          </Typography>
        )}
      </Box>
      
      {isUser && (
        <Avatar sx={{ 
          width: 36, // Увеличиваем с 32 до 36
          height: 36, // Увеличиваем с 32 до 36
          bgcolor: '#8e6e53', // Коричневый цвет для пользователя
          fontSize: '1rem' // Увеличиваем с дефолтного до 1rem
        }}>
          U
        </Avatar>
      )}
    </Box>
  );
}; 