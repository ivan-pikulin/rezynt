import React from 'react';
import { Box, Avatar, Typography, CircularProgress } from '@mui/material';
import { ChatMessage as ChatMessageType } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
}

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
          <>
            <CircularProgress size={16} color="inherit" />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Thinking...
            </Typography>
          </>
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