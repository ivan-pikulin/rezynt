import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { resumeApi } from '../../shared/services/api';
import { Resume } from '../../shared/services/api/types';
import { useTemplate } from '../../shared/hooks/useTemplate';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import ResumeEditor from './components/ResumeEditor';
import TemplateSelector from './components/TemplateSelector';
import { convertApiResumeToDisplayData } from './utils/resumeDataConverter';
import { TemplateConfig } from '../../shared/types/resume';
import { COLORS } from '../../shared/theme/theme';

const RefinePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');
  
  const { selectedTemplate, updateTemplate } = useTemplate(resumeId);
  const [showPreview, setShowPreview] = useState(false);
  const { resume, isLoading: loading, error: queryError, updateResumeInCache } = useResumeQuery(resumeId);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  // Устанавливаем заголовок при загрузке резюме
  useEffect(() => {
    if (resume) {
      setTitleValue(resume.title);
    }
  }, [resume]);

  // Обработчик обновления резюме
  const handleResumeUpdate = (updatedResume: Resume) => {
    updateResumeInCache(updatedResume);
    setTitleValue(updatedResume.title);
  };

  // Обработчик изменения шаблона
  const handleTemplateChange = async (template: TemplateConfig) => {
    updateTemplate(template);
    
    // Сохраняем новый шаблон на сервере
    if (resumeId) {
      try {
        await resumeApi.assignTemplateBySlug(parseInt(resumeId), template.id);
        // Обновляем кеш резюме
        if (resume) {
          updateResumeInCache({ ...resume, template_id: parseInt(template.id) });
        }
      } catch (err) {
        console.error('Error updating template:', err);
      }
    }
  };

  // Обработчик редактирования заголовка
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  // Обработчик сохранения заголовка
  const handleTitleSave = async () => {
    if (!resume || !resumeId) return;
    
    try {
      const updatedResume = await resumeApi.updateResumePartial(parseInt(resumeId), { title: titleValue });
      updateResumeInCache(updatedResume);
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Error saving title:', err);
      setTitleValue(resume.title); // Возвращаем оригинальное значение
    }
  };

  // Обработчик отмены редактирования заголовка
  const handleTitleCancel = () => {
    setTitleValue(resume?.title || '');
    setIsEditingTitle(false);
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

  const handleDownload = () => {
    navigate(`/export?resume_id=${resumeId}`);
  };

  // Если нет resumeId, показываем ошибку
  if (!resumeId) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: COLORS.resume.section.background
      }}>
        <ErrorMessage 
          message={t('refine.error.noResumeId')} 
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  // Если загрузка, показываем индикатор
  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: COLORS.resume.section.background
      }}>
        <LoadingSpinner message={t('refine.loading')} />
      </Box>
    );
  }

  // Если ошибка, показываем сообщение
  if (queryError || !resume) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: COLORS.resume.section.background
      }}>
        <ErrorMessage 
          message={queryError || t('refine.error.notFound')} 
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
      bgcolor: COLORS.resume.section.background,
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
        gap: 0,
        overflow: 'hidden'
      }}>
        {/* Вертикальная панель шаблонов слева */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' },
          width: '180px',
          height: '100%',
          flexDirection: 'column',
          bgcolor: COLORS.resume.header.background,
          borderRight: `1px solid ${COLORS.resume.section.border}`,
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <Box sx={{ 
            p: 2,
            overflow: 'auto',
            height: '100%',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: COLORS.grey[100],
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: COLORS.grey[400],
              borderRadius: 3,
              '&:hover': {
                bgcolor: COLORS.grey[500],
              },
            },
          }}>
            <TemplateSelector 
              onTemplateChange={handleTemplateChange}
              horizontalLayout={false}
            />
          </Box>
        </Box>

        {/* Левая панель: редактор */}
        <Box sx={{ 
          width: { xs: '100%', md: 'calc(50% - 180px)' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: COLORS.resume.header.background
        }}>
          {/* Заголовок резюме */}
          <Box sx={{ 
            bgcolor: COLORS.resume.header.background,
            borderBottom: `1px solid ${COLORS.resume.section.border}`,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0
          }}>
            {isEditingTitle ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <TextField
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ flex: 1 }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleSave();
                    } else if (e.key === 'Escape') {
                      handleTitleCancel();
                    }
                  }}
                />
                <IconButton size="small" onClick={handleTitleSave} color="primary">
                  <SaveIcon />
                </IconButton>
                <IconButton size="small" onClick={handleTitleCancel} color="error">
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
                  {titleValue}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={handleTitleEdit}
                  sx={{ 
                    opacity: 0.6, 
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s'
                  }}
                >
                  <EditIcon />
                </IconButton>
              </>
            )}
          </Box>
          
          {/* Мобильная панель шаблонов (только на мобильных) */}
          <Box sx={{ 
            display: { xs: 'block', md: 'none' },
            bgcolor: COLORS.resume.header.background,
            p: 2,
            overflow: 'hidden',
            height: 160,
            flexShrink: 0,
            borderBottom: `1px solid ${COLORS.resume.section.border}`
          }}>
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: COLORS.grey[100],
                borderRadius: 3,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: COLORS.grey[400],
                borderRadius: 3,
                '&:hover': {
                  bgcolor: COLORS.grey[500],
                },
              },
            }}>
              <TemplateSelector 
                onTemplateChange={handleTemplateChange}
                horizontalLayout={true}
              />
            </Box>
          </Box>

          {/* Редактор резюме */}
          <Box sx={{ 
            flex: 1,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0
          }}>
            <ResumeEditor 
              resume={resume} 
              onResumeUpdate={handleResumeUpdate}
            />
          </Box>
        </Box>

        {/* Вертикальный разделитель */}
        <Box sx={{ 
          display: { xs: 'none', md: 'block' },
          width: '1px',
          bgcolor: COLORS.resume.section.border,
          mx: 0
        }} />
        
        {/* Правая панель: превью резюме */}
        <Box sx={{ 
          width: { xs: '100%', md: '50%' },
          height: { xs: '50%', md: 'auto' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'white'
        }}>
          {/* Превью резюме */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'auto',
            p: 2
          }}>
            <ResumeRenderer 
              data={displayData} 
              scale={0.8} 
              templateId={selectedTemplate?.id}
            />
          </Box>

          {/* Кнопка Download внизу */}
          <Box sx={{ 
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'white'
          }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Download Resume
            </Button>
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
          borderBottom: `1px solid ${COLORS.chat.input.border}`,
          bgcolor: COLORS.chat.input.background
        }}>
          <Box sx={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.chat.input.text }}>
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
    </Box>
  );
};

export default RefinePage; 