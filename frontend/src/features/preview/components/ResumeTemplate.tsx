import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const ResumeTemplate: React.FC = () => {
  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }}>
      {/* Превью область */}
      <Box sx={{ 
        flex: 1,
        bgcolor: '#e0e0e0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200
      }}>
        <Typography variant="body2" color="text.secondary">
          Preview here
        </Typography>
      </Box>

      {/* Карточка с информацией */}
      <Card sx={{ 
        border: '1px solid #666',
        borderRadius: '4px',
        boxShadow: 'none'
      }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <InfoIcon sx={{ fontSize: 16, color: '#666' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Title
              </Typography>
            </Box>
            <IconButton size="small" sx={{ p: 0 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Body text.
          </Typography>
          <Box sx={{ 
            bgcolor: '#666',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: '4px',
            display: 'inline-block',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}>
            Button
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResumeTemplate; 