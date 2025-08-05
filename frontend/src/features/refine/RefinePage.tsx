import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import TemplateSelector from './components/TemplateSelector';
import { TemplateService } from '../../shared/services/templateService';
import { TemplateConfig } from '../../shared/types/resume';

const RefinePage: React.FC = () => {
  const navigate = useNavigate();
  const demoData = TemplateService.createDemoData();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(
    TemplateService.getTemplates()[0]
  );

  const handleNextStep = () => {
    navigate('/export');
  };

  const handleTemplateChange = (template: TemplateConfig) => {
    setSelectedTemplate(template);
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Общая шапка */}
      <Header activeStep={2} />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        gap: 2,
        alignItems: 'stretch',
        overflow: 'hidden' // Предотвращаем прокрутку на уровне контейнера
      }}>
        {/* Левая панель: селектор шаблонов - 1/4 ширины */}
        <Box sx={{ 
          width: '25%',
          minWidth: '250px',
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Селектор шаблонов - с прокруткой */}
          <Box sx={{ 
            flex: 1,
            overflow: 'auto',
            p: 2
          }}>
            <TemplateSelector onTemplateChange={handleTemplateChange} />
          </Box>
          
          {/* Кнопка Next - внизу левой панели */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 2,
            flexShrink: 0,
            borderTop: '1px solid #e0e0e0'
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
              Next: Export
            </Button>
          </Box>
        </Box>
        
        {/* Правая область: превью резюме - 3/4 ширины */}
        <Box sx={{ 
          flex: 1, // Занимает оставшиеся 3/4 ширины
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          bgcolor: 'transparent' // Убираем фон
        }}>
          <ResumeRenderer 
            data={demoData} 
            scale={1} 
            templateId={selectedTemplate?.id}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RefinePage; 