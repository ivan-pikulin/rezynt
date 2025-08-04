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
        p: 2, 
        gap: 2,
        alignItems: 'stretch'
      }}>
        {/* Левая панель: селектор шаблонов */}
        <Box sx={{ 
          width: '300px',
          minWidth: '300px',
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          p: 2
        }}>
          <TemplateSelector onTemplateChange={handleTemplateChange} />
        </Box>
        
        {/* Центральная часть: превью резюме */}
        <Box sx={{ 
          flex: 1,
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3
        }}>
          <Box sx={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'hidden'
          }}>
            <ResumeRenderer 
              data={demoData} 
              scale={0.8} 
              templateId={selectedTemplate?.id}
            />
          </Box>
          
          {/* Кнопка Next */}
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
    </Box>
  );
};

export default RefinePage; 