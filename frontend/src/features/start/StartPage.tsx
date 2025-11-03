import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../shared/components/Header/Header';
import StartOptions from './components/StartOptions';
import { useUser } from '../../shared/hooks';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { COLORS } from '../../shared/theme/theme';
import { resumeApi } from '../../shared/services/api';
import GradientSpinnerAnimation from '../../shared/components/GradientSpinnerAnimation';

const StartPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  // Check for resume - use guest mode if user is not registered
  const isGuest = !user?.is_registered;
  const { resume } = useResumeQuery(isGuest);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // List of messages to display during upload processing
  const uploadMessages = [
    t('start.uploadMessages.0'),
    t('start.uploadMessages.1'),
    t('start.uploadMessages.2'),
    t('start.uploadMessages.3'),
    t('start.uploadMessages.4'),
    t('start.uploadMessages.5'),
    t('start.uploadMessages.6'),
    t('start.uploadMessages.7'),
    t('start.uploadMessages.8'),
    t('start.uploadMessages.9'),
    t('start.uploadMessages.10'),
    t('start.uploadMessages.11'),
    t('start.uploadMessages.12'),
    t('start.uploadMessages.13'),
    t('start.uploadMessages.14')
  ];

  // Handle task_id parameter for processing uploaded resume
  useEffect(() => {
    const taskIdParam = searchParams.get('task_id');
    if (taskIdParam && user && !isProcessingUpload) {
      setTaskId(taskIdParam);
      setIsProcessingUpload(true);
      setUploadMessage(uploadMessages[0]);
      
      // Start message rotation
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % uploadMessages.length;
        setUploadMessage(uploadMessages[messageIndex]);
      }, 4000);
      
      // Poll for task completion
      const pollTask = async () => {
        try {
          const result = await resumeApi.getUploadResult(taskIdParam);
          
          if (result.status === 'completed') {
            // Success - navigate to chat
            clearInterval(interval);
            setIsProcessingUpload(false);
            setUploadError(null);
            
            navigate('/chat', { replace: true });
          } else if (result.status === 'error' || result.state === 'FAILURE') {
            // Error - stop processing and show error
            clearInterval(interval);
            setIsProcessingUpload(false);
            setTaskId(null);
            setUploadError(result.error || result.message || t('errors.uploadFailed'));
            // Clear error message from URL
            navigate('/start', { replace: true });
          } else if (result.status === 'pending' || result.status === 'processing') {
            // Still processing - continue polling
            setTimeout(pollTask, 3000);
          } else {
            // Unknown status - continue polling but log it
            console.warn('Unknown task status:', result);
            setTimeout(pollTask, 3000);
          }
        } catch (error) {
          console.error('Error polling task:', error);
          // On API error, continue polling but with longer delay
          setTimeout(pollTask, 5000);
        }
      };
      
      // Start polling after 2 seconds
      setTimeout(pollTask, 2000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [searchParams, user, navigate, isProcessingUpload]);

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Create - already on this page
        break;
      case 1: // Analyze
        navigate('/refine');
        break;
      case 2: // Export
        navigate('/export');
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tab: 'resumes' | 'ai-writer' | 'editor') => {
    switch (tab) {
      case 'resumes':
        // Navigate to editor (user has one resume)
        navigate('/refine');
        break;
      case 'ai-writer':
        navigate('/builder');
        break;
      case 'editor':
        navigate('/refine');
        break;
    }
  };

  const guardStartFromScratch = () => {
    // No guard needed - user can overwrite their resume
    return true;
  };

  const guardUploadResume = () => {
    // No guard needed - user can overwrite their resume
    return true;
  };

  // Check if resume has any meaningful content
  const hasResumeContent = () => {
    if (!resume) return false;
    
    // Check if resume has at least one of these filled
    const hasContent = 
      (resume.personal_info?.first_name && resume.personal_info.first_name.trim().length > 0) ||
      (resume.personal_info?.last_name && resume.personal_info.last_name.trim().length > 0) ||
      (resume.professional_summary && resume.professional_summary.trim().length > 0) ||
      (resume.skills && resume.skills.length > 0) ||
      (resume.work_experience && resume.work_experience.length > 0) ||
      (resume.education && resume.education.length > 0);
    
    return hasContent;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: COLORS.resume.section.background
    }}>
      {/* Common header */}
      <Header 
        activeStep={0} 
        showBackButton={false}
        showNextButton={false}
        showLogo={true}
        onStepClick={handleStepClick}
        isProUser={user?.is_premium}
        currentTab="resumes"
        onTabChange={handleTabChange}
        disableStepsClick={!user}
        customSteps={[t('header.steps.start'), t('header.steps.refine'), t('header.steps.export')]}
        hideNavigationArrows={true}
      />
      
      {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 6 },
        minHeight: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 80px)' }
      }}>
        {isProcessingUpload ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3,
            maxWidth: 500,
            textAlign: 'center'
          }}>
            <GradientSpinnerAnimation size={60} />
            <Typography variant="h6" sx={{ color: COLORS.resume.text.primary, fontWeight: 500 }}>
              {uploadMessage}
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.resume.text.secondary }}>
              {t('start.uploadProcessing')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: '100%', maxWidth: 900 }}>
            <StartOptions 
              onGuardStartFromScratch={guardStartFromScratch}
              onGuardUploadResume={guardUploadResume}
              isProcessingUpload={isProcessingUpload}
              uploadMessage={uploadMessage}
              uploadError={uploadError}
              onClearError={() => setUploadError(null)}
              isStartFromScratchDisabled={!!taskId}
            />
            
            {/* Message about existing resume */}
            {hasResumeContent() && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: COLORS.resume.text.secondary,
                    fontSize: '14px'
                  }}
                >
                  {t('start.existingResume.message')}.{' '}
                  <Typography
                    component="span"
                    onClick={() => navigate('/refine')}
                    sx={{
                      color: COLORS.button.primary.background,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '14px',
                      '&:hover': {
                        color: COLORS.button.primary.backgroundHover
                      }
                    }}
                  >
                    {t('start.existingResume.action')}
                  </Typography>
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StartPage;
