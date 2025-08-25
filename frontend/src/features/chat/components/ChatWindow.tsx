import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import { COLORS } from '../../../shared/theme/theme';

interface ChatWindowProps {
  resumeId: string | null;
  onResumeUpdate?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ resumeId, onResumeUpdate }) => {
  const { messages, isLoading, sendUserMessage, messagesEndRef } = useChat(resumeId, onResumeUpdate);
  
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: COLORS.gradients.secondary,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      position: 'relative'
    }}>
      {/* Современная шапка чата */}
      <Box sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2, // Уменьшил с 3 до 2
        background: COLORS.gradients.primary, // Использую цвета приложения
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Декоративные элементы */}
        <Box sx={{
          position: 'absolute',
          top: -15, // Уменьшил с -20 до -15
          right: -15, // Уменьшил с -20 до -15
          width: 45, // Уменьшил с 60 до 45
          height: 45, // Уменьшил с 60 до 45
          borderRadius: '50%',
          background: 'rgba(198, 156, 114, 0.2)', // Использую цвет c69c72ff
          backdropFilter: 'blur(10px)'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -10, // Уменьшил с -15 до -10
          left: -10, // Уменьшил с -15 до -10
          width: 30, // Уменьшил с 40 до 30
          height: 30, // Уменьшил с 40 до 30
          borderRadius: '50%',
          background: 'rgba(192, 183, 177, 0.15)', // Использую цвет c0b7b1ff
          backdropFilter: 'blur(10px)'
        }} />
        
        <Typography variant="h6" sx={{ 
          fontWeight: 700, 
          color: 'white',
          fontSize: '1.1rem', // Уменьшил с 1.25rem до 1.1rem
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 1
        }}>
          AI Writer
        </Typography>
        
        <Chip
          icon={<StarIcon sx={{ fontSize: '1rem', color: COLORS.warning.main }} />} // Использую цвет c69c72ff
          label="21/100"
          size="small"
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontWeight: 600,
            fontSize: '0.8rem', // Уменьшил с 0.875rem до 0.8rem
            '& .MuiChip-icon': {
              color: COLORS.warning.main // Использую цвет c69c72ff
            },
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease'
            },
            position: 'relative',
            zIndex: 1
          }}
        />
      </Box>

      {/* Область чата с современным дизайном */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        minHeight: 0,
        maxHeight: 'calc(100% - 60px - 56px)', // Обновил с учетом новой высоты области ввода (60px)
        background: COLORS.gradients.white,
        position: 'relative'
      }}>
        {/* Декоративная сетка на фоне */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.03) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />
        
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLoading={isLoading}
          />
        ))}
        {/* Invisible div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Современное поле ввода */}
      <Box sx={{
        flexShrink: 0,
        p: 1.5, // Уменьшил с 2 до 1.5
        height: 'auto',
        minHeight: '60px', // Уменьшил с 72px до 60px
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}>
        <ChatInput onSendMessage={sendUserMessage} disabled={isLoading} />
      </Box>
    </Box>
  );
};

export default ChatWindow; 