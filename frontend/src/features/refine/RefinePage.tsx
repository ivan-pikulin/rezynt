import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../shared/components/Header/Header';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import TemplateSelector from './components/TemplateSelector';
import ResumeEditor from './components/ResumeEditor';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { TemplateService } from '../../shared/services/templateService';
import { TemplateConfig } from '../../shared/types/resume';
import { Resume } from '../../shared/services/api/types';
import { resumeApi } from '../../shared/services/api';
import { convertApiResumeToDisplayData } from './utils/resumeDataConverter';

const RefinePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(
    TemplateService.getTemplateById('tero') || TemplateService.getTemplates()[0]
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем данные резюме с сервера
  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setError(t('refine.error.noResumeId'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const resumeData = await resumeApi.getResume(resumeId);
        setResume(resumeData);
        
        // Устанавливаем шаблон из резюме, если он есть
        if (resumeData.template_id) {
          const template = TemplateService.getTemplateById(resumeData.template_id);
          if (template) {
            setSelectedTemplate(template);
          }
        }
      } catch (err) {
        console.error('Error loading resume:', err);
        setError(t('refine.error.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [resumeId]);

  // Обработчик обновления резюме
  const handleResumeUpdate = (updatedResume: Resume) => {
    setResume(updatedResume);
  };

  // Обработчик изменения шаблона
  const handleTemplateChange = async (template: TemplateConfig) => {
    setSelectedTemplate(template);
    
    // Сохраняем новый шаблон на сервере
    if (resumeId) {
      try {
        await resumeApi.assignTemplateBySlug(resumeId, template.id);
        // Обновляем локальное состояние резюме
        if (resume) {
          setResume({ ...resume, template_id: template.id });
        }
      } catch (err) {
        console.error('Error updating template:', err);
      }
    }
  };

  const handleNext = () => {
    navigate(`/export?resume_id=${resumeId}`);
  };

  const handleBack = () => {
    navigate(`/chat?resume_id=${resumeId}`);
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start
        navigate('/');
        break;
      case 1: // Generate
        navigate(`/chat?resume_id=${resumeId}`);
        break;
      case 2: // Refine - уже на этой странице
        break;
      case 3: // Export
        navigate(`/export?resume_id=${resumeId}`);
        break;
      default:
        break;
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const toggleEditor = () => {
    setShowEditor(!showEditor);
  };

  // Если загрузка, показываем индикатор
  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: '#f5f6fa'
      }}>
        <LoadingSpinner message={t('refine.loading')} />
      </Box>
    );
  }

  // Если ошибка, показываем сообщение
  if (error || !resume) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: '#f5f6fa'
      }}>
        <ErrorMessage 
          message={error || t('refine.error.notFound')} 
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  // Преобразуем данные резюме для отображения
  const displayData = convertApiResumeToDisplayData(resume);

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
        showLogo={true}
        onStepClick={handleStepClick}
      />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 0, sm: 2 },
        p: { xs: 1, sm: 2 },
        alignItems: 'stretch',
        overflow: 'hidden'
      }}>
        {/* Левая панель: селектор шаблонов */}
        <Box sx={{ 
          width: { xs: '100%', md: '30%' },
          minWidth: { xs: 'auto', md: '300px' },
          height: { xs: '100%', md: 'auto' },
          bgcolor: 'white',
          borderRadius: { xs: 0, sm: '8px' },
          boxShadow: { xs: 'none', sm: '0 2px 8px rgba(0, 0, 0, 0.1)' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Кнопка предварительного просмотра (только на мобильных) */}
          <Box sx={{
            position: 'absolute',
            top: { xs: 8, sm: 12 },
            right: { xs: 8, sm: 12 },
            zIndex: 10,
            display: { xs: 'block', md: 'none' }
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

          {/* Содержимое панели */}
          <Box sx={{ 
            flex: 1,
            overflow: 'auto',
            p: { xs: 1, sm: 2 }
          }}>
            <TemplateSelector onTemplateChange={handleTemplateChange} />
          </Box>
        </Box>
        
        {/* Центральная область: превью резюме */}
        <Box sx={{ 
          flex: { xs: 0, md: 1 },
          width: { xs: 0, md: '40%' },
          display: { xs: 'none', md: 'flex' },
          overflow: 'auto',
          justifyContent: 'center',
          alignItems: 'flex-start',
          bgcolor: 'transparent',
          position: 'relative'
        }}>
          {/* Кнопка редактирования в верхнем правом углу резюме */}
          <Box sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10,
            display: showEditor ? 'none' : 'block'
          }}>
            <IconButton
              onClick={toggleEditor}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <EditIcon />
            </IconButton>
          </Box>

          <ResumeRenderer 
            data={displayData} 
            scale={1} 
            templateId={selectedTemplate?.id}
          />
        </Box>

        {/* Правая панель: редактор резюме */}
        <Box sx={{ 
          width: { xs: 0, md: showEditor ? '30%' : '0' },
          minWidth: { xs: 0, md: showEditor ? '300px' : '0' },
          height: { xs: '100%', md: 'auto' },
          bgcolor: 'white',
          borderRadius: { xs: 0, sm: '8px' },
          boxShadow: { xs: 'none', sm: '0 2px 8px rgba(0, 0, 0, 0.1)' },
          display: { xs: showEditor ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease-in-out',
          opacity: showEditor ? 1 : 0,
          transform: showEditor ? 'translateX(0)' : 'translateX(100%)'
        }}>
          {/* Заголовок панели редактора */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid #eee',
            bgcolor: '#f8f9fa'
          }}>
            <Box sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
              {t('refine.editor.title')}
            </Box>
            <IconButton
              onClick={toggleEditor}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Содержимое редактора */}
          <Box sx={{ 
            flex: 1,
            overflow: 'auto'
          }}>
            <ResumeEditor 
              resume={resume} 
              onResumeUpdate={handleResumeUpdate}
            />
          </Box>
        </Box>
      </Box>

      {/* Боковая панель с превью (на весь экран для мобильных) */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'white',
        zIndex: 1000,
        display: { xs: showPreview ? 'flex' : 'none', md: 'none' },
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
            {t('refine.preview.title')}
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
              data={displayData} 
              scale={0.6} 
              templateId={selectedTemplate?.id}
            />
          </Box>
        </Box>
      </Box>

      {/* Боковая панель с редактором (на весь экран для мобильных) */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'white',
        zIndex: 1000,
        display: { xs: showEditor ? 'flex' : 'none', md: 'none' },
        flexDirection: 'column',
        transform: { xs: showEditor ? 'translateX(0)' : 'translateX(100%)', md: 'translateX(100%)' },
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
            {t('refine.editor.title')}
          </Box>
          <IconButton
            onClick={toggleEditor}
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
          overflow: 'auto'
        }}>
          <ResumeEditor 
            resume={resume} 
            onResumeUpdate={handleResumeUpdate}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RefinePage; 