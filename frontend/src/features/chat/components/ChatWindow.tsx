import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

const ChatWindow: React.FC = () => {
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
        {/* Сообщение ассистента */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: '#9c27b0',
            fontSize: '0.875rem'
          }}>
            A
          </Avatar>
          <Box sx={{ 
            bgcolor: 'white',
            p: 1.5,
            borderRadius: '8px',
            maxWidth: '70%',
            fontSize: '0.875rem'
          }}>
            Hello! I am a smart assistant for resume creation
          </Box>
        </Box>

        {/* Сообщение пользователя */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
          <Box sx={{ 
            bgcolor: '#1976d2',
            color: 'white',
            p: 1.5,
            borderRadius: '8px',
            maxWidth: '70%',
            fontSize: '0.875rem'
          }}>
            Hi, ok, lets start! Ask me questions please
          </Box>
          <Avatar sx={{ 
            width: 32, 
            height: 32,
            bgcolor: '#ff9800'
          }}>
            U
          </Avatar>
        </Box>

        {/* Сообщение ассистента */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: '#9c27b0',
            fontSize: '0.875rem'
          }}>
            A
          </Avatar>
          <Box sx={{ 
            bgcolor: 'white',
            p: 1.5,
            borderRadius: '8px',
            maxWidth: '70%',
            fontSize: '0.875rem'
          }}>
            Please tell me about your experience, where did you work?
          </Box>
        </Box>
      </Box>

      {/* Поле ввода */}
      <Box sx={{ 
        p: 1,
        display: 'flex',
        gap: 1,
        alignItems: 'center'
      }}>
        <TextField
          fullWidth
          size="small"
          placeholder="I have worked in different places"
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
          sx={{ 
            bgcolor: '#1976d2',
            color: 'white',
            '&:hover': {
              bgcolor: '#1565c0'
            }
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatWindow; 