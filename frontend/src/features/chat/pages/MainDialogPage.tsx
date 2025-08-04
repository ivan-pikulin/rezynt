import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import ChatWindow from '../components/ChatWindow';
import ResumeTemplate from '../../preview/components/ResumeTemplate';
import { TemplateService } from '../../preview/services/templateService';

const steps = ['Start', 'Generate', 'Refine', 'Export'];

const MainDialogPage: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(1); // пример: шаг 2 активен
  const demoData = TemplateService.createDemoData();

  const getNextStepTitle = () => {
    if (activeStep < steps.length - 1) {
      return steps[activeStep + 1];
    }
    return 'Завершить';
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Верхняя панель с прогресс-баром */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #eee',
        px: 4, 
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Логотип */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/rezynt-logo-with-name.svg" 
            alt="Rezynt" 
            style={{ 
              height: '32px', 
              width: 'auto',
              maxWidth: '160px'
            }} 
          />
        </Box>

        {/* Прогресс-бар */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ flex: 1, maxWidth: 600, mx: 'auto' }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.875rem',
                    color: index <= activeStep ? '#1976d2' : '#999'
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Пустое место для баланса */}
        <Box sx={{ width: 120 }} />
      </Box>
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        p: 2, 
        gap: 2,
        alignItems: 'stretch', // Растягиваем на всю высоту
        justifyContent: 'center'
      }}>
        {/* Основной контейнер со скруглением */}
        <Box sx={{
          width: '95%',
          height: '100%', // Занимаем всю доступную высоту
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
            width: '400px', // Фиксированная ширина вместо flex: 1
            minWidth: '400px',
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', // Центрируем по вертикали
            alignItems: 'center',
            gap: 2,
            p: 2
          }}>
            {/* Превью резюме */}
            <Box sx={{ 
              height: '400px', // Фиксированная высота
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden',
              '--resume-scale': '0.35' // Масштаб для превью в чате
            }}>
              <ResumeTemplate data={demoData} />
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
                Next: {getNextStepTitle()}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainDialogPage; 