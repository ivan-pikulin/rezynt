import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Box sx={{ 
      p: 1,
      display: 'flex',
      gap: 1.5,
      alignItems: 'center', // Центрируем по вертикали
      width: '100%',
      position: 'relative' // Для правильного позиционирования
    }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        size="small"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        autoFocus
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px', // Более округлые углы
            bgcolor: '#f8f9fa', // Светло-серый фон
            fontSize: '0.95rem',
            height: '55px', // Минимальная высота для удобства
            paddingRight: '60px', // Место для кнопки
            '& fieldset': {
              borderColor: 'transparent', // Убираем границу
              borderWidth: '1px'
            },
            '&:hover fieldset': {
              borderColor: '#e0e0e0' // Граница при наведении
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2', // Граница при фокусе
              borderWidth: '2px'
            },
            '& input': {
              fontSize: '0.95rem',
              padding: '12px 16px' // Увеличиваем отступы
            },
            '& textarea': {
              fontSize: '0.95rem',
              padding: '12px 16px',
              lineHeight: '1.4'
            }
          },
          '& .MuiInputBase-input': {
            '&::placeholder': {
              color: '#9e9e9e',
              opacity: 1
            }
          }
        }}
      />
      <IconButton 
        size="medium"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        sx={{ 
          bgcolor: message.trim() ? '#1976d2' : '#e0e0e0',
          color: message.trim() ? 'white' : '#9e9e9e',
          width: '40px',
          height: '40px',
          borderRadius: '50%', // Круглая кнопка
          transition: 'all 0.2s ease-in-out',
          flexShrink: 0, // Предотвращаем сжатие кнопки
          '&:hover': {
            bgcolor: message.trim() ? '#1565c0' : '#d5d5d5',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)' // Тень при наведении
          },
          '&:active': {
            transform: 'scale(0.95)',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
          },
          '&:disabled': {
            bgcolor: '#f5f5f5',
            color: '#bdbdbd',
            transform: 'none',
            boxShadow: 'none'
          },
          '& .MuiSvgIcon-root': {
            fontSize: '20px', // Увеличиваем размер иконки
            transition: 'transform 0.2s ease-in-out'
          },
          '&:hover .MuiSvgIcon-root': {
            transform: 'translateX(1px)' // Легкое смещение иконки при наведении
          }
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}; 