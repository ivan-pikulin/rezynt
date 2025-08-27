import React, { memo } from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { ChatMessage as ChatMessageType } from '../hooks/useChat';
import { COLORS } from '../../../shared/theme/theme';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
  currentThinkingPhrase?: string;
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

export const ChatMessage: React.FC<ChatMessageProps> = memo(({ message, isLoading = false, currentThinkingPhrase = 'Thinking...' }) => {
  const isUser = message.sender === 'user';
  // Показываем фразу ожидания только если нет контента
  const showLoading = isLoading && !isUser && !message.content;
  
  return (
    <Box 
      data-message-id={message.id}
      sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'flex-start',
        justifyContent: isUser ? 'flex-end' : 'flex-start'
      }}>
      {!isUser && (
        <Avatar sx={{ 
          width: 36, // Увеличиваем с 32 до 36
          height: 36, // Увеличиваем с 32 до 36
          bgcolor: COLORS.chat.bot.avatar, // Синий цвет для бота
          fontSize: '1rem' // Увеличиваем с 0.875rem до 1rem
        }}>
          <SmartToyIcon sx={{ fontSize: '1.2rem', color: 'white' }} />
        </Avatar>
      )}
      
      <Box sx={{ 
        bgcolor: isUser ? COLORS.chat.user.background : COLORS.chat.bot.background, // Синий для пользователя, голубой для бота
        color: isUser ? COLORS.chat.user.text : COLORS.chat.bot.text, // Белый текст для пользователя, синий для бота
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
              {currentThinkingPhrase}
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
          bgcolor: COLORS.chat.user.avatar, // Коричневый цвет для пользователя
          fontSize: '1rem' // Увеличиваем с дефолтного до 1rem
        }}>
          U
        </Avatar>
      )}
    </Box>
  );
}); 