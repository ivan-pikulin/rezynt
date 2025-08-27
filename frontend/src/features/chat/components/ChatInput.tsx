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
      onSendMessage(message); // Убираем .trim() чтобы сохранить переносы строк
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
        minRows={1}
        maxRows={6}
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
            minHeight: '40px', // Минимальная высота
            maxHeight: '150px', // Максимальная высота (примерно 6 строк)
            paddingRight: '0px', // Убираем paddingRight у контейнера
            overflow: 'hidden', // Убираем прокрутку у контейнера
            display: 'flex', // Flexbox для правильного размещения
            alignItems: 'stretch', // Растягиваем по высоте
            flexDirection: 'column', // Вертикальное направление
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
              padding: '12px 76px 12px 16px', // Отступы: top right bottom left (76px справа для кнопки)
              margin: 0, // Убираем margin
              lineHeight: '1.4',
              resize: 'none', // Отключаем ручное изменение размера
              overflow: 'auto', // Прокрутка только внутри textarea
              maxHeight: '126px', // Максимальная высота textarea (150px - 24px отступы)
              border: 'none', // Убираем границу у textarea
              outline: 'none', // Убираем outline у textarea
              width: '100%', // Занимаем всю ширину
              boxSizing: 'border-box', // Включаем padding в расчет ширины
              position: 'relative' // Для правильного позиционирования
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