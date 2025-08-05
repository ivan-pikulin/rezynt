import React from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ChatWindow from './components/ChatWindow';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { TemplateService } from '../../shared/services/templateService';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const demoData = TemplateService.createDemoData();

  const handleNext = () => {
    navigate('/refine');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Общая шапка */}
      <Header 
        activeStep={1} 
        onNext={handleNext}
        onBack={handleBack}
        nextButtonText="Refine"
        previousButtonText="Start"
      />
      
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
          
          {/* Правая часть: превью */}
          <Box sx={{ 
            width: '400px',
            minWidth: '400px',
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage; 