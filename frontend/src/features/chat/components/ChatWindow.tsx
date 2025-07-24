import React from 'react';
import Box from '@mui/material/Box';

const ChatWindow: React.FC = () => {
  return (
    <Box sx={{ height: '100%', width: '100%', p: 2, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      {/* Здесь будет чат */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <p>Здесь будет чат</p>
      </div>
      <Box mt={2}>
        <input style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} placeholder="Введите сообщение..." />
      </Box>
    </Box>
  );
};

export default ChatWindow; 