import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ChatWindow from './components/ChatWindow';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { TemplateService } from '../../shared/services/templateService';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const demoData = TemplateService.createDemoData();

  const handleNextStep = () => {
    navigate('/refine');
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Общая шапка */}
      <Header activeStep={1} />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        p: 2, 
        gap: 2,
        alignItems: 'stretch',
        justifyContent: 'center'
      }}>
        {/* Основной контейнер со скруглением */}
        <Box sx={{
          width: '95%',
          height: '100%',
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          overflow: 'hidden'
        }}>
          {/* Левая+центральная часть: чат */}
          <Box sx={{ flex: 2, minWidth: 0, p: 2, display: 'flex', flexDirection: 'column' }}>
            <ChatWindow />
          </Box>
          
          {/* Правая часть: превью + кнопка */}
          <Box sx={{ 
            width: '400px',
            minWidth: '400px',
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            p: 2
          }}>
            {/* Превью резюме */}
            <Box sx={{ 
              height: '400px',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden',
              '--resume-scale': '0.35'
            }}>
              <ResumeRenderer data={demoData} scale={0.35} />
            </Box>
            
            {/* Кнопка Next */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              pt: 1
            }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleNextStep}
                sx={{
                  borderRadius: '6px',
                  px: 3,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: '#666',
                  '&:hover': {
                    bgcolor: '#555'
                  }
                }}
              >
                Next: Refine
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage; 