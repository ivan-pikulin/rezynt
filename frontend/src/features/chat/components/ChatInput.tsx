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
      onSendMessage(message); // Remove .trim() to preserve line breaks
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
      alignItems: 'center', // Center vertically
      width: '100%',
      position: 'relative' // For proper positioning
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
            borderRadius: '20px', // More rounded corners
            bgcolor: '#f8f9fa', // Light gray background
            fontSize: '0.95rem',
            minHeight: '40px', // Minimum height
            maxHeight: '150px', // Maximum height (about 6 lines)
            paddingRight: '0px', // Remove paddingRight from container
            overflow: 'hidden', // Remove scrolling from container
            display: 'flex', // Flexbox for proper placement
            alignItems: 'stretch', // Stretch by height
            flexDirection: 'column', // Vertical direction
            '& fieldset': {
              borderColor: 'transparent', // Remove border
              borderWidth: '1px'
            },
            '&:hover fieldset': {
              borderColor: '#e0e0e0' // Border on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2', // Border on focus
              borderWidth: '2px'
            },
            '& input': {
              fontSize: '0.95rem',
              padding: '12px 16px' // Increase padding
            },
            '& textarea': {
              fontSize: '0.95rem',
              padding: '12px 76px 12px 16px', // Padding: top right bottom left (76px right for button)
              margin: 0, // Remove margin
              lineHeight: '1.4',
              resize: 'none', // Disable manual resizing
              overflow: 'auto', // Scrolling only inside textarea
              maxHeight: '126px', // Maximum textarea height (150px - 24px padding)
              border: 'none', // Remove border from textarea
              outline: 'none', // Remove outline from textarea
              width: '100%', // Take full width
              boxSizing: 'border-box', // Include padding in width calculation
              position: 'relative' // For proper positioning
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
          borderRadius: '50%', // Round button
          transition: 'all 0.2s ease-in-out',
          flexShrink: 0, // Prevent button compression
          '&:hover': {
            bgcolor: message.trim() ? '#1565c0' : '#d5d5d5',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)' // Shadow on hover
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
            fontSize: '20px', // Increase icon size
            transition: 'transform 0.2s ease-in-out'
          },
          '&:hover .MuiSvgIcon-root': {
            transform: 'translateX(1px)' // Light icon shift on hover
          }
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}; 