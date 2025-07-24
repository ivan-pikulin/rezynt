import React from 'react';
import Box from '@mui/material/Box';

const ResumeTemplate: React.FC = () => {
  return (
    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 2, minWidth: 280, maxWidth: 340, minHeight: 400 }}>
      {/* Пример шаблона резюме */}
      <h2 style={{ margin: 0 }}>Иван Иванов</h2>
      <p style={{ margin: 0 }}>Frontend Developer</p>
      <hr />
      <p><b>Опыт:</b> 3 года в React, TypeScript, MUI</p>
      <p><b>Контакты:</b> ivan@example.com</p>
    </Box>
  );
};

export default ResumeTemplate; 