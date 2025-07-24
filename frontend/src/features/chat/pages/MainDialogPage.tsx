import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import ChatWindow from '../components/ChatWindow';
import ResumeTemplate from '../../preview/components/ResumeTemplate';

const steps = ['Ввод данных', 'Обсуждение', 'Превью', 'Экспорт'];

const MainDialogPage: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(1); // пример: шаг 2 активен

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f6fa' }}>
      {/* Прогресс-бар */}
      <Box sx={{ px: 4, pt: 3, pb: 2, bgcolor: 'white', borderBottom: '1px solid #eee' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      {/* Основная область */}
      <Box sx={{ flex: 1, display: 'flex', p: 3, gap: 3 }}>
        {/* Левая+центральная часть: чат */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <ChatWindow />
        </Box>
        {/* Правая часть: превью */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <ResumeTemplate />
        </Box>
      </Box>
      {/* Кнопки управления */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
        <Button variant="outlined">Назад</Button>
        <Button variant="contained">Далее</Button>
      </Box>
    </Box>
  );
};

export default MainDialogPage; 