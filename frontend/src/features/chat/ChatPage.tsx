import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ChatWindow from './components/ChatWindow';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { useTemplate } from '../../shared/hooks/useTemplate';
import { useUser } from '../../shared/hooks';
import { convertApiResumeToResumeData } from '../../shared/utils/resumeDataConverter';
import { COLORS } from '../../shared/theme/theme';
import { useMediaQuery } from '@mui/material';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');
  const { resume: resumeData, refreshResume } = useResumeQuery(resumeId);
  const { selectedTemplate } = useTemplate(resumeId, resumeData?.template_slug);
  const { user } = useUser();
  const [showPreview, setShowPreview] = useState(false);
  
  // Определяем мобильный режим для экранов до 768px
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleNext = () => {
    navigate(`/refine?resume_id=${resumeId}`);
  };

  const handleBack = () => {
    navigate('/resumes');
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start
        navigate('/');
        break;
      case 1: // Generate - уже на этой странице
        break;
      case 2: // Refine
        navigate(`/refine?resume_id=${resumeId}`);
        break;
      case 3: // Export
        navigate(`/export?resume_id=${resumeId}`);
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tab: 'resumes' | 'ai-writer' | 'editor') => {
    switch (tab) {
      case 'resumes':
        navigate('/resumes');
        break;
      case 'ai-writer':
        // Already on AI Writer page
        break;
      case 'editor':
        navigate(`/refine?resume_id=${resumeId}`);
        break;
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

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
        activeStep={1} 
        onNext={handleNext}
        onBack={handleBack}
        nextButtonText="Refine"
        previousButtonText="Resumes"
        showLogo={true} // Показываем лого на десктопе
        showBackButton={true} // Показываем кнопку "Назад" на странице чата
        onStepClick={handleStepClick}
        isProUser={user?.is_premium}
        currentTab="ai-writer"
        onTabChange={handleTabChange}
      />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        minHeight: 0, // Важно для правильной работы flex
        display: 'flex', 
        p: isMobile ? 1 : 2, // Уменьшаем отступы на мобильных
        gap: isMobile ? 0 : 2, // Убираем отступы между элементами на мобильных
        alignItems: 'stretch',
        justifyContent: 'center'
      }}>
        {/* Основной контейнер со скруглением */}
        <Box sx={{
          width: isMobile ? '100%' : '95%', // Полная ширина на мобильных
          height: '100%',
          bgcolor: 'white',
          borderRadius: isMobile ? 0 : '8px', // Убираем скругление на мобильных
          boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)', // Убираем тень на мобильных
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Кнопка с глазом для открытия превью */}
          <Box sx={{
            position: 'absolute',
            top: isMobile ? 8 : 12,
            right: isMobile ? 8 : 12,
            zIndex: 10,
            display: isMobile ? 'block' : 'none' // Показываем только на мобильных
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
            flex: 1, // Занимаем все доступное пространство
            minWidth: 0, 
            minHeight: 0, // Важно для правильной работы flex
            p: isMobile ? 1 : 2, // Уменьшаем отступы на мобильных
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden' // Предотвращаем переполнение
          }}>
            <ChatWindow 
              resumeId={resumeId} 
              onResumeUpdate={refreshResume} 
              fromUpload={resumeData?.from_upload || false}
            />
          </Box>
          
          {/* Правая часть: превью (скрыто на мобильных по умолчанию) */}
          <Box sx={{ 
            width: isMobile ? 0 : '400px',
            display: isMobile ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2
          }}>
            {resumeData && (
              <ResumeRenderer 
                data={convertApiResumeToResumeData(resumeData)} 
                scale={0.35}
                templateId={selectedTemplate?.id}
              />
            )}
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
        display: isMobile ? (showPreview ? 'flex' : 'none') : 'none', // Показываем только на мобильных
        flexDirection: 'column',
        transform: isMobile ? (showPreview ? 'translateX(0)' : 'translateX(100%)') : 'translateX(100%)',
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
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          overflow: 'auto'
        }}>
          {resumeData && (
            <ResumeRenderer 
              data={convertApiResumeToResumeData(resumeData)} 
              scale={0.6}
              templateId={selectedTemplate?.id}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage; 