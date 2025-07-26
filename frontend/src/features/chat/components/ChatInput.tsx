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
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Box sx={{ 
      p: 1,
      display: 'flex',
      gap: 1,
      alignItems: 'center'
    }}>
      <TextField
        fullWidth
        size="small"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            bgcolor: 'white',
            '& fieldset': {
              borderColor: '#ddd'
            }
          }
        }}
      />
      <IconButton 
        size="small"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        sx={{ 
          bgcolor: '#1976d2',
          color: 'white',
          '&:hover': {
            bgcolor: '#1565c0'
          },
          '&:disabled': {
            bgcolor: '#ccc'
          }
        }}
      >
        <SendIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}; 