import EditIcon from '@mui/icons-material/Edit';
import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import { useUser } from '../../shared/hooks';
import { useAuth } from '../../shared/hooks/useAuth';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
// import { useTemplate } from '../../shared/hooks/useTemplate';
import { resumeApi } from '../../shared/services/api';
import { Resume } from '../../shared/services/api/types';
import { COLORS } from '../../shared/theme/theme';
// import { TemplateConfig } from '../../shared/types/resume';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import EditorAccordion from './components/EditorAccordion';
import ScoreBar from './components/ScoreBar';
import ImprovementSections from './components/ImprovementSections';
import { getResumeAnalysis } from './analysisApi';

const RefinePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');
  
  const { resume, isLoading: loading, error: queryError, updateResumeInCache } = useResumeQuery(resumeId);
  // Templates not used in the new layout
  const { user } = useUser();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [analysis, setAnalysis] = useState<{ score: number; label: string; subtitle: string; sections: any[] } | null>(null);
  
  // Define mobile mode for screens up to 768px
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Check if resume belongs to user
  useEffect(() => {
    if (authLoading || loading) return; // Wait for authentication and resume loading
    
    if (resume) {
      const isGuestResume = !resumeId || resumeId === 'guest' || resume.id === -1;
      
      // If this is not a guest resume and user is not authenticated
      if (!isGuestResume && !isAuthenticated) {
        navigate('/login');
        return;
      }
      
      // If user is authenticated and this is not their resume
      if (isAuthenticated && authUser && !isGuestResume && resume.user_id !== authUser.id) {
        navigate('/login');
        return;
      }
    }
  }, [resume, authUser, isAuthenticated, authLoading, loading, resumeId, navigate]);

  // Set title when loading resume
  useEffect(() => {
    if (resume) {
      setTitleValue(resume.title);
    }
  }, [resume]);

  // Resume update handler
  const handleResumeUpdate = (updatedResume: Resume) => {
    updateResumeInCache(updatedResume);
    setTitleValue(updatedResume.title);
  };

  // Load analysis (mocked)
  useEffect(() => {
    if (!resumeId) return;
    getResumeAnalysis(resumeId).then(setAnalysis).catch(() => setAnalysis(null));
  }, [resumeId]);

  // Title editing handler
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  // Title save handler
  const handleTitleSave = async () => {
    if (!resume || !resumeId) return;
    
    // Close editing immediately
    setIsEditingTitle(false);
    
    try {
      const updatedResume = await resumeApi.updateResumePartial(parseInt(resumeId), { title: titleValue });
      updateResumeInCache(updatedResume);
    } catch (err) {
      // In case of error, return to original value
      setTitleValue(resume.title);
      console.error('Error saving title:', err);
    }
  };
  
  // Title cancel handler
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
      case 0: // Start - disabled for unauthenticated users
        // Do nothing - step is not clickable
        break;
      case 1: // Generate
        navigate(`/chat?resume_id=${resumeId}`);
        break;
      case 2: // Refine - already on this page
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
        navigate(`/chat?resume_id=${resumeId}`);
        break;
      case 'editor':
        // Already on editor page
        break;
    }
  };

  // Removed preview/export logic for the new 2-column layout

  // If no resumeId, show error
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

  // If loading, show indicator
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

  // If error, show message
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

  const marketingText = t('refine.marketing.hook', 'Reach 95%+ and watch job offers come to you.');

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: COLORS.resume.section.background,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Common header */}
      <Header 
        activeStep={2} 
        onNext={handleNext}
        onBack={handleBack}
        nextButtonText="Export"
        previousButtonText="Generate"
        showLogo={true}
        onStepClick={handleStepClick}
        allowFirstStepClick={false} // Disable step navigation for all users
        isProUser={user?.is_premium}
        currentTab="editor"
        onTabChange={handleTabChange}
      />

      {/* Score bar */}
      {analysis && (
        <ScoreBar
          score={analysis.score}
          label={analysis.label}
          subtitle={analysis.subtitle}
          marketingText={marketingText}
        />
      )}
      
      {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 0,
        overflow: 'hidden'
      }}>
        {/* Left column: Improvement sections */}
        <Box sx={{ width: { xs: '100%', md: '40%' }, borderRight: { md: `1px solid ${COLORS.resume.section.border}` }, bgcolor: COLORS.resume.header.background }}>
          <Box sx={{ p: 1, borderBottom: `1px solid ${COLORS.resume.section.border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEditingTitle ? (
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
                onBlur={handleTitleSave}
              />
            ) : (
              <>
                <IconButton 
                  size="small" 
                  onClick={handleTitleEdit}
                  sx={{ 
                    opacity: 0.6, 
                    p: 0.5,
                    minWidth: 'auto',
                    width: 24,
                    height: 24,
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s'
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
                  {titleValue}
                </Typography>
              </>
            )}
          </Box>
          <ImprovementSections sections={analysis?.sections || []} />
        </Box>
        {/* Right column: Editor accordions */}
        <Box sx={{ flex: 1, minWidth: 0, bgcolor: COLORS.resume.header.background }}>
          <EditorAccordion resume={resume} onResumeUpdate={handleResumeUpdate} resumeId={resumeId} />
        </Box>
      </Box>
      {/* End 2-column layout */}
    </Box>
  );
};

export default RefinePage; 