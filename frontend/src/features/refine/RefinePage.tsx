import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import { useUser } from '../../shared/hooks';
import { useAuth } from '../../shared/hooks/useAuth';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
// import { useTemplate } from '../../shared/hooks/useTemplate';
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
  const [analysis, setAnalysis] = useState<{ score: number; label: string; subtitle: string; sections: any[] } | null>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState('');
  
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

  // Resume update handler
  const handleResumeUpdate = (updatedResume: Resume) => {
    updateResumeInCache(updatedResume);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    setLastSaveTime(`${hours}:${minutes}:${seconds}`);
  };

  // Set initial save time
  useEffect(() => {
    if (resume && !lastSaveTime) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setLastSaveTime(`${hours}:${minutes}:${seconds}`);
    }
  }, [resume, lastSaveTime]);

  // Load analysis (mocked)
  useEffect(() => {
    if (!resumeId) return;
    getResumeAnalysis(resumeId).then(setAnalysis).catch(() => setAnalysis(null));
  }, [resumeId]);

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

      {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 0,
        overflow: 'hidden',
        bgcolor: '#F5F7FA'
      }}>
        {/* Left column: Score and Improvement sections */}
        <Box sx={{ width: { xs: '100%', md: '40%' }, borderRight: { md: `1px solid ${COLORS.resume.section.border}` }, bgcolor: '#F5F7FA' }}>
          {/* Score bar */}
          {analysis && (
            <Box sx={{ p: 2 }}>
              <ScoreBar
                score={analysis.score}
                label={analysis.label}
                subtitle={analysis.subtitle}
                marketingText={marketingText}
              />
            </Box>
          )}
          
          <ImprovementSections sections={analysis?.sections || []} />
        </Box>
        {/* Right column: Editor accordions */}
        <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <EditorAccordion resume={resume} onResumeUpdate={handleResumeUpdate} resumeId={resumeId} />
          
          {/* Save Notification */}
          {showSaveNotification && (
            <Box sx={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              zIndex: 1000,
            }}>
              <CheckCircleIcon sx={{ width: '14px', height: '14px', color: '#10b981' }} />
              <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>
                All changes saved at {lastSaveTime}
              </Typography>
              <button 
                onClick={() => {
                  const now = new Date();
                  const hours = String(now.getHours()).padStart(2, '0');
                  const minutes = String(now.getMinutes()).padStart(2, '0');
                  const seconds = String(now.getSeconds()).padStart(2, '0');
                  setLastSaveTime(`${hours}:${minutes}:${seconds}`);
                }}
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#2563eb',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'none',
                }}
              >
                Save now
              </button>
            </Box>
          )}
        </Box>
      </Box>
      {/* End 2-column layout */}
    </Box>
  );
};

export default RefinePage; 