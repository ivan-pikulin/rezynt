import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ResumeTemplate: React.FC = () => {
  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Превью область в формате A4 */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '400px', // Базовая ширина
        aspectRatio: '1 / 1.414', // Соотношение сторон A4
        bgcolor: '#e0e0e0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ccc'
      }}>
        <Typography variant="body2" color="text.secondary">
          Preview here
        </Typography>
      </Box>
    </Box>
  );
};

export default ResumeTemplate; 