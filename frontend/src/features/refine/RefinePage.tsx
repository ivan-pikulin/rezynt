import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
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
  const [showPreview, setShowPreview] = useState(false);

  const handleNext = () => {
    navigate('/export');
  };

  const handleBack = () => {
    navigate('/chat');
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start
        navigate('/');
        break;
      case 1: // Generate
        navigate('/chat');
        break;
      case 2: // Refine - уже на этой странице
        break;
      case 3: // Export
        navigate('/export');
        break;
      default:
        break;
    }
  };

  const handleTemplateChange = (template: TemplateConfig) => {
    setSelectedTemplate(template);
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
        activeStep={2} 
        onNext={handleNext}
        onBack={handleBack}
        nextButtonText="Export"
        previousButtonText="Generate"
        showLogo={true} // Показываем лого на десктопе
        onStepClick={handleStepClick}
      />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, // Вертикально на мобильных, горизонтально на десктопе
        gap: { xs: 0, sm: 2 }, // Убираем отступы на мобильных
        p: { xs: 1, sm: 2 }, // Добавляем отступы на мобильных
        alignItems: 'stretch',
        overflow: 'hidden' // Предотвращаем прокрутку на уровне контейнера
      }}>
        {/* Левая панель: селектор шаблонов */}
        <Box sx={{ 
          width: { xs: '100%', md: '30%' }, // Полная ширина на мобильных
          minWidth: { xs: 'auto', md: '300px' }, // Убираем минимальную ширину на мобильных
          height: { xs: '100%', md: 'auto' }, // Полная высота на мобильных
          bgcolor: 'white',
          borderRadius: { xs: 0, sm: '8px' }, // Убираем скругление на мобильных
          boxShadow: { xs: 'none', sm: '0 2px 8px rgba(0, 0, 0, 0.1)' }, // Убираем тень на мобильных
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Кнопка с глазом для открытия превью */}
          <Box sx={{
            position: 'absolute',
            top: { xs: 8, sm: 12 },
            right: { xs: 8, sm: 12 },
            zIndex: 10,
            display: { xs: 'block', md: 'none' } // Показываем только на мобильных
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

          {/* Селектор шаблонов - с прокруткой */}
          <Box sx={{ 
            flex: 1,
            overflow: 'auto',
            p: { xs: 1, sm: 2 } // Уменьшаем отступы на мобильных
          }}>
            <TemplateSelector onTemplateChange={handleTemplateChange} />
          </Box>
        </Box>
        
        {/* Правая область: превью резюме (скрыто на мобильных) */}
        <Box sx={{ 
          flex: { xs: 0, md: 1 }, // Скрываем на мобильных
          width: { xs: 0, md: '70%' }, // Скрываем на мобильных
          display: { xs: 'none', md: 'flex' }, // Скрываем на мобильных
          overflow: 'auto',
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

      {/* Боковая панель с превью (на весь экран) */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'white',
        zIndex: 1000,
        display: { xs: showPreview ? 'flex' : 'none', md: 'none' }, // Показываем только на мобильных
        flexDirection: 'column',
        transform: { xs: showPreview ? 'translateX(0)' : 'translateX(100%)', md: 'translateX(100%)' },
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
            <ResumeRenderer 
              data={demoData} 
              scale={0.6} 
              templateId={selectedTemplate?.id}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RefinePage; 