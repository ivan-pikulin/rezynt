import React from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import StartOptions from './components/StartOptions';
import { COLORS } from '../../shared/theme/theme';

const StartPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start - уже на этой странице
        break;
      case 1: // Generate
        navigate('/chat');
        break;
      case 2: // Refine
        navigate('/refine');
        break;
      case 3: // Export
        navigate('/export');
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: COLORS.resume.section.background
    }}>
      {/* Общая шапка */}
      <Header 
        activeStep={0} 
        showBackButton={false}
        showNextButton={false}
        showLogo={true} // Показываем лого на десктопе
        onStepClick={undefined} // Отключаем кликабельность шагов
      />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 }, // Адаптивные отступы
        py: { xs: 3, sm: 4, md: 6 }, // Дополнительные вертикальные отступы
        minHeight: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 80px)' } // Учитываем высоту header
      }}>
        <StartOptions />
      </Box>
    </Box>
  );
};

export default StartPage; 