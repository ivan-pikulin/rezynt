import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../shared/components/Header/Header';
import StartOptions from './components/StartOptions';
import { useUser, usePolling } from '../../shared/hooks';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { COLORS } from '../../shared/theme/theme';
import { resumeApi } from '../../shared/services/api';
import GradientSpinnerAnimation from '../../shared/components/GradientSpinnerAnimation';
import { TaskStatus } from '../../shared/services/api/types';

const StartPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  // Check for resume - use guest mode if user is not registered
  const isGuest = !user?.is_registered;
  const { resume } = useResumeQuery(isGuest);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(searchParams.get('taskId'));
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // Determine current page/tab based on URL
  const currentPath = window.location.pathname;
  const isOnBuildTab = currentPath === '/build';

  // List of messages to display during upload processing
  const uploadMessages = useMemo(() => ([
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
  ]), [t]);

  // Handle analyzing parameter for processing uploaded resume
  const isAnalyzing = searchParams.get('analyzing') === 'true';
  const taskIdFromQuery = searchParams.get('taskId');

  useEffect(() => {
    if (isAnalyzing && taskIdFromQuery && !activeTaskId) {
      setActiveTaskId(taskIdFromQuery);
    }
  }, [isAnalyzing, taskIdFromQuery, activeTaskId]);

  useEffect(() => {
    if (isAnalyzing && activeTaskId && !isProcessingUpload) {
      setIsProcessingUpload(true);
      setUploadMessage(uploadMessages[0]);
    }
  }, [isAnalyzing, activeTaskId, isProcessingUpload, uploadMessages]);

  const handleRedirectToRefine = useCallback((taskId: string) => {
    const refinePath = `/refine?analyzing=true&taskId=${encodeURIComponent(taskId)}`;

    if (user && !user.has_completed_onboarding) {
      navigate(`/onboarding?redirect=${encodeURIComponent(refinePath)}`, { replace: true });
    } else {
      navigate(refinePath, { replace: true });
    }
  }, [navigate, user]);

  const fetchTaskStatus = useCallback(async (): Promise<TaskStatus> => {
    if (!activeTaskId) {
      throw new Error('No active task');
    }
    return resumeApi.getUploadStatus(activeTaskId);
  }, [activeTaskId]);

  const { data: taskStatus } = usePolling<TaskStatus>({
    fetchFn: fetchTaskStatus,
    shouldStop: (status) => ['ANALYZING', 'SUCCESS', 'FAILURE'].includes(status.state),
    interval: 2000,
    enabled: !!activeTaskId && isProcessingUpload,
  });

  // Message rotation during processing (only before backend starts sending messages)
  useEffect(() => {
    if (!isProcessingUpload || taskStatus?.message) return;

    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % uploadMessages.length;
      setUploadMessage(uploadMessages[messageIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isProcessingUpload, taskStatus, uploadMessages]);

  useEffect(() => {
    if (!taskStatus) return;

    if (taskStatus.message) {
      setUploadMessage(taskStatus.message);
    }

    if (taskStatus.state === 'FAILURE') {
      setUploadError(taskStatus.error || taskStatus.message || t('start.uploadError'));
      setIsProcessingUpload(false);
      setActiveTaskId(null);
      setHasRedirected(false);
      const next = new URLSearchParams(searchParams);
      next.delete('analyzing');
      next.delete('taskId');
      setSearchParams(next, { replace: true });
      return;
    }

    if ((taskStatus.state === 'ANALYZING' || taskStatus.state === 'SUCCESS') && activeTaskId && !hasRedirected) {
      setHasRedirected(true);
      handleRedirectToRefine(activeTaskId);
    }
  }, [taskStatus, activeTaskId, hasRedirected, handleRedirectToRefine, searchParams, setSearchParams, t]);

  const handleTaskCreated = useCallback((taskId: string) => {
    setActiveTaskId(taskId);
    setHasRedirected(false);
    setUploadError(null);
    setUploadMessage(uploadMessages[0]);
    setIsProcessingUpload(true);

    const next = new URLSearchParams(searchParams);
    next.set('analyzing', 'true');
    next.set('taskId', taskId);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, uploadMessages]);

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

  const handleTabChange = (tab: 'resumes' | 'ai-writer' | 'editor' | 'build' | 'analyze' | 'export') => {
    switch (tab) {
      case 'build':
        // Already on build page if premium, otherwise navigate to builder
        if (currentPath !== '/build') {
          navigate('/build');
        }
        break;
      case 'analyze':
        navigate('/refine');
        break;
      case 'export':
        navigate('/export');
        break;
      case 'resumes':
      case 'ai-writer':
      case 'editor':
        // Legacy tabs - navigate to refine
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
        currentTab={isOnBuildTab ? 'build' : 'resumes'}
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
              isStartFromScratchDisabled={false}
              onUploadTaskCreated={handleTaskCreated}
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
