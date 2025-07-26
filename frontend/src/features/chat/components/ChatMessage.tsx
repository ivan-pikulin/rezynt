import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { ChatMessage as ChatMessageType } from '../types/chat';

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
  
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 1, 
      alignItems: 'flex-start',
      justifyContent: isUser ? 'flex-end' : 'flex-start'
    }}>
      {!isUser && (
        <Avatar sx={{ 
          width: 32, 
          height: 32, 
          bgcolor: '#9c27b0',
          fontSize: '0.875rem'
        }}>
          A
        </Avatar>
      )}
      
      <Box sx={{ 
        bgcolor: isUser ? '#1976d2' : 'white',
        color: isUser ? 'white' : 'inherit',
        p: 1.5,
        borderRadius: '8px',
        maxWidth: '70%',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: '24px'
      }}>
        {showLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Thinking
            </Typography>
            <AnimatedDots />
          </Box>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {message.content}
          </Typography>
        )}
      </Box>
      
      {isUser && (
        <Avatar sx={{ 
          width: 32, 
          height: 32,
          bgcolor: '#ff9800'
        }}>
          U
        </Avatar>
      )}
    </Box>
  );
}; 