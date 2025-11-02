import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
import { analysisApi } from '../../shared/services/api';

const RefinePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // No more resume_id in URL - each user has one resume
  const { resume, isLoading: loading, error: queryError, updateResumeInCache } = useResumeQuery(false);
  const [analysis, setAnalysis] = useState<{ score: number; label: string; subtitle: string; sections: any[] } | null>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState('');
  const [isRefreshingAnalysis, setIsRefreshingAnalysis] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [authUser, isAuthenticated, authLoading, navigate]);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [localResume, setLocalResume] = useState<Resume | null>(resume || null);
  const [mobileTab, setMobileTab] = useState<'analysis' | 'editor'>('analysis');

  // Update local resume when fetched resume changes
  useEffect(() => {
    if (resume) {
      setLocalResume(resume);
    }
  }, [resume]);

  // Resume update handler - just updates local state
  const handleResumeUpdate = (updatedResume: Resume) => {
    setLocalResume(updatedResume);
  };

  // Save now handler - calls PUT /resume/ API
  const handleSaveNow = async () => {
    if (!localResume || !isAuthenticated) return;
    
    setIsSaving(true);
    setShowSuccessAnimation(false);
    
    try {
      const { resumeApi } = await import('../../shared/services/api');
      await resumeApi.updateResume(localResume);
      
      // Update cache and timestamp
      updateResumeInCache(localResume);
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setLastSaveTime(`${hours}:${minutes}:${seconds}`);
      
      // Show success animation
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving resume:', error);
      // TODO: Show error notification
    } finally {
      setIsSaving(false);
    }
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

  // Load analysis from backend API
  useEffect(() => {
    if (resume) {
      analysisApi.getAnalysis()
        .then(setAnalysis)
        .catch((error) => {
          console.error('Error loading analysis:', error);
          setAnalysis(null);
        });
    }
  }, [resume]);

  // Refresh analysis handler
  const handleRefreshAnalysis = async () => {
    if (!resume) return;
    
    setIsRefreshingAnalysis(true);
    try {
      const newAnalysis = await analysisApi.refreshAnalysis();
      setAnalysis(newAnalysis);
    } catch (error) {
      console.error('Error refreshing analysis:', error);
    } finally {
      setIsRefreshingAnalysis(false);
    }
  };

  const handleNext = () => {
    navigate('/export');
  };

  const handleBack = () => {
    navigate('/builder');
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Create
        navigate('/start');
        break;
      case 1: // Analyze - already on this page
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
        // Already on editor page
        break;
    }
  };

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
        activeStep={1} 
        onNext={handleNext}
        onBack={handleBack}
        nextButtonText="Export"
        previousButtonText="Create"
        showLogo={true}
        onStepClick={handleStepClick}
        allowFirstStepClick={true}
        isProUser={user?.is_premium}
        currentTab="editor"
        onTabChange={handleTabChange}
        hideNavigationArrows={true}
        customSteps={[t('header.steps.start'), t('header.steps.refine'), t('header.steps.export')]}
      />

      {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 0,
        overflow: 'hidden',
        bgcolor: '#F5F7FA'
      }}>
        {/* Mobile tabs (xs only) */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, borderBottom: `1px solid ${COLORS.resume.section.border}`, bgcolor: 'white' }}>
          <Tabs 
            value={mobileTab} 
            onChange={(e, newValue) => setMobileTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
              }
            }}
          >
            <Tab label={t('refine.mobileTabs.analysis')} value="analysis" />
            <Tab label={t('refine.mobileTabs.editor')} value="editor" />
          </Tabs>
        </Box>

        {/* Content area */}
        <Box sx={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
        }}>
          {/* Left column: Score and Improvement sections */}
          <Box sx={{ 
            width: { xs: '100%', md: '40%' }, 
            borderRight: { md: `1px solid ${COLORS.resume.section.border}` }, 
            bgcolor: '#F5F7FA',
            display: { xs: mobileTab === 'analysis' ? 'block' : 'none', md: 'block' },
            overflow: 'auto'
          }}>
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
            
            {/* Refresh Analysis Button */}
            <Box sx={{ px: 2, pb: 1 }}>
              <button
                onClick={handleRefreshAnalysis}
                disabled={isRefreshingAnalysis}
                style={{
                  width: '100%',
                  backgroundColor: isRefreshingAnalysis ? '#e5e7eb' : '#2563eb',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isRefreshingAnalysis ? 'not-allowed' : 'pointer',
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isRefreshingAnalysis && <CircularProgress size={14} sx={{ color: 'white' }} />}
                {isRefreshingAnalysis ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
            </Box>
            
            <ImprovementSections sections={analysis?.sections || []} />
          </Box>
          {/* Right column: Editor accordions */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0, 
            position: 'relative',
            display: { xs: mobileTab === 'editor' ? 'block' : 'none', md: 'block' }
          }}>
            <EditorAccordion resume={localResume || resume} onResumeUpdate={handleResumeUpdate} />
          
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
              {/* Icon with animation */}
              <Box sx={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSaving ? (
                  <Fade in={true} timeout={300}>
                    <CircularProgress size={14} thickness={4} sx={{ color: '#2563eb' }} />
                  </Fade>
                ) : (
                  <Zoom in={!isSaving} timeout={400} style={{ transitionDelay: showSuccessAnimation ? '0ms' : '0ms' }}>
                    <CheckCircleIcon 
                      sx={{ 
                        width: '14px', 
                        height: '14px', 
                        color: showSuccessAnimation ? '#10b981' : '#10b981',
                        animation: showSuccessAnimation ? 'pulse 0.5s ease-in-out' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.2)' },
                          '100%': { transform: 'scale(1)' },
                        }
                      }} 
                    />
                  </Zoom>
                )}
              </Box>
              
              <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>
                All changes saved at {lastSaveTime}
              </Typography>
              <button 
                onClick={handleSaveNow}
                disabled={isSaving}
                style={{
                  backgroundColor: isSaving ? '#e5e7eb' : '#dbeafe',
                  color: isSaving ? '#9ca3af' : '#2563eb',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  textTransform: 'none',
                }}
              >
                {isSaving ? 'Saving...' : 'Save now'}
              </button>
            </Box>
          )}
          </Box>
        </Box>
      </Box>
      {/* End 2-column layout */}
    </Box>
  );
};

export default RefinePage; 