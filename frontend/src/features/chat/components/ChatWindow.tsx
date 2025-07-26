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
      p: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f8f9fa',
      border: '1px solid #1976d2',
      borderRadius: '4px'
    }}>
      {/* Область чата */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLoading={isLoading}
          />
        ))}
      </Box>

      {/* Поле ввода */}
      <ChatInput onSendMessage={sendUserMessage} disabled={isLoading} />
    </Box>
  );
};

export default ChatWindow; 