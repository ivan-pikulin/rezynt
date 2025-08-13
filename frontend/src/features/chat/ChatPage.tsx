import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ChatWindow from './components/ChatWindow';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { TemplateService } from '../../shared/services/templateService';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const demoData = TemplateService.createDemoData();
  const [showPreview, setShowPreview] = useState(false);

  const handleNext = () => {
    navigate('/refine');
  };

  const handleBack = () => {
    navigate('/');
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Общая шапка */}
      <Header 
        activeStep={1} 
        onNext={handleNext}
        onBack={handleBack}
        nextButtonText="Refine"
        previousButtonText="Start"
        showLogo={false} // Скрываем лого на мобильных
      />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        p: { xs: 1, sm: 2 }, // Уменьшаем отступы на мобильных
        gap: { xs: 0, sm: 2 }, // Убираем отступы между элементами на мобильных
        alignItems: 'stretch',
        justifyContent: 'center'
      }}>
        {/* Основной контейнер со скруглением */}
        <Box sx={{
          width: { xs: '100%', sm: '95%' }, // Полная ширина на мобильных
          height: '100%',
          bgcolor: 'white',
          borderRadius: { xs: 0, sm: '8px' }, // Убираем скругление на мобильных
          boxShadow: { xs: 'none', sm: '0 2px 8px rgba(0, 0, 0, 0.1)' }, // Убираем тень на мобильных
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Кнопка с глазом для открытия превью */}
          <Box sx={{
            position: 'absolute',
            top: { xs: 8, sm: 12 },
            right: { xs: 8, sm: 12 },
            zIndex: 10,
            display: { xs: 'block', sm: 'none' } // Показываем только на мобильных
          }}>
            <IconButton
              onClick={togglePreview}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                }
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Box>

          {/* Левая+центральная часть: чат */}
          <Box sx={{ 
            flex: { xs: 1, sm: 2 }, // Занимаем всю ширину на мобильных
            minWidth: 0, 
            p: { xs: 1, sm: 2 }, // Уменьшаем отступы на мобильных
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <ChatWindow />
          </Box>
          
          {/* Правая часть: превью (скрыто на мобильных по умолчанию) */}
          <Box sx={{ 
            width: { xs: 0, sm: '400px' }, // Скрываем на мобильных
            minWidth: { xs: 0, sm: '400px' }, // Скрываем на мобильных
            display: { xs: 'none', sm: 'flex' }, // Скрываем на мобильных
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

      {/* Боковая панель с превью (на весь экран) */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'white',
        zIndex: 1000,
        display: { xs: showPreview ? 'flex' : 'none', sm: 'none' }, // Показываем только на мобильных
        flexDirection: 'column',
        transform: { xs: showPreview ? 'translateX(0)' : 'translateX(100%)', sm: 'translateX(100%)' },
        transition: 'transform 0.3s ease-in-out',
        overflow: 'hidden'
      }}>
        {/* Заголовок панели */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #eee',
          bgcolor: '#f8f9fa'
        }}>
          <Box sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
            Resume Preview
          </Box>
          <IconButton
            onClick={togglePreview}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Содержимое панели */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          overflow: 'auto'
        }}>
          {/* Превью резюме */}
          <Box sx={{ 
            width: '100%',
            maxWidth: '400px',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start',
            position: 'relative',
            overflow: 'hidden',
            '--resume-scale': '0.6'
          }}>
            <ResumeRenderer data={demoData} scale={0.6} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage; 