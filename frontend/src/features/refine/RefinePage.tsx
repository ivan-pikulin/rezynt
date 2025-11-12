import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import EditorAccordion, { EditorAccordionHandle } from './components/EditorAccordion';
import ScoreBar from './components/ScoreBar';
import ImprovementSections from './components/ImprovementSections';
import { analysisApi } from '../../shared/services/api';

const RefinePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // No more resume_id in URL - each user has one resume
  // Wait for auth to load before attempting to load resume
  const { resume, isLoading: loading, error: queryError, updateResumeInCache } = useResumeQuery(false);
  const [analysis, setAnalysis] = useState<{ score: number; label: string; subtitle: string; sections: any[] } | null>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState('');
  const [isRefreshingAnalysis, setIsRefreshingAnalysis] = useState(false);
  const editorRef = useRef<EditorAccordionHandle>(null);
  
  // Track dismissed/applied improvement points for dynamic score recalculation
  const [dismissedPointIds, setDismissedPointIds] = useState<Set<string>>(new Set());
  
  // Auto-save state
  const [lastSavedResume, setLastSavedResume] = useState<Resume | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Undo/Redo state
  const [history, setHistory] = useState<Resume[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoOperation = useRef(false);
  const historyIndexRef = useRef(historyIndex);
  
  // Keep ref in sync with state
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);
  
  // Authentication check removed - guest users can access this page

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [localResume, setLocalResume] = useState<Resume | null>(resume || null);
  const [mobileTab, setMobileTab] = useState<'analysis' | 'editor'>('analysis');

  // Update local resume when fetched resume changes
  useEffect(() => {
    if (resume) {
      setLocalResume(resume);
      setLastSavedResume(resume);
      // Initialize history with the fetched resume
      if (history.length === 0) {
        setHistory([resume]);
        setHistoryIndex(0);
      }
    }
  }, [resume]);

  // Resume update handler - updates local state and optionally adds to history
  const handleResumeUpdate = (updatedResume: Resume, addToHistoryFlag: boolean = false) => {
    console.log('📝 handleResumeUpdate called', {
      timestamp: new Date().toISOString(),
      addToHistoryFlag,
      updatedResume: JSON.stringify(updatedResume).substring(0, 200) + '...'
    });
    setLocalResume(updatedResume);
    
    // Add to history if flag is set
    if (addToHistoryFlag && !isUndoRedoOperation.current) {
      console.log('📚 Adding to history (explicit event)');
      addToHistory(updatedResume);
    }
  };
  
  // Add to history helper
  const addToHistory = useCallback((resume: Resume) => {
    console.log('📚 addToHistory called');
    
    setHistory(prevHistory => {
      // Trim future history if we're not at the end using ref
      const currentIndex = historyIndexRef.current;
      const trimmedHistory = prevHistory.slice(0, currentIndex + 1);
      
      console.log('📚 Current history state:', {
        currentIndex,
        historyLength: prevHistory.length,
        trimmedLength: trimmedHistory.length
      });
      
      // Check if the current state is different from the last entry
      const lastEntry = trimmedHistory[trimmedHistory.length - 1];
      if (lastEntry && JSON.stringify(lastEntry) === JSON.stringify(resume)) {
        console.log('📚 Skipping: identical to last entry');
        return prevHistory;
      }
      
      // Add new state to history
      const updatedHistory = [...trimmedHistory, resume];
      
      console.log('📚 Added to history:', {
        newLength: updatedHistory.length,
        newIndex: currentIndex + 1
      });
      
      // Limit history size to 50 entries
      return updatedHistory.slice(-50);
    });
    
    setHistoryIndex(prevIndex => {
      const newIndex = prevIndex + 1;
      console.log('📚 Updated history index:', { from: prevIndex, to: newIndex });
      return newIndex;
    });
  }, []);
  
  // Track unsaved changes
  useEffect(() => {
    if (!localResume || !lastSavedResume) {
      setHasUnsavedChanges(false);
      return;
    }
    
    const hasChanges = JSON.stringify(localResume) !== JSON.stringify(lastSavedResume);
    setHasUnsavedChanges(hasChanges);
  }, [localResume, lastSavedResume]);
  
  // Auto-save interval (1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges && localResume && isAuthenticated) {
        handleSaveNow();
      }
    }, 1000); // 1 second
    
    return () => clearInterval(interval);
  }, [hasUnsavedChanges, localResume, isAuthenticated]);
  
  // Manual history tracking - no automatic tracking
  // History is added explicitly when specific events occur (field blur, item add/delete)
  
  // Undo handler
  const handleUndo = useCallback(() => {
    console.log('⬅️ Undo called:', { historyIndex, historyLength: history.length });
    
    if (historyIndex > 0) {
      isUndoRedoOperation.current = true;
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      console.log('⬅️ Undoing to index:', newIndex, {
        experienceCount: previousState.work_experience?.length,
        educationCount: previousState.education?.length
      });
      
      setHistoryIndex(newIndex);
      // Create a new object to force re-render
      setLocalResume({ ...previousState });
      
      setTimeout(() => {
        isUndoRedoOperation.current = false;
        console.log('⬅️ Undo operation complete');
      }, 0);
    } else {
      console.log('⬅️ Cannot undo: at beginning of history');
    }
  }, [historyIndex, history]);
  
  // Redo handler
  const handleRedo = useCallback(() => {
    console.log('➡️ Redo called:', { historyIndex, historyLength: history.length });
    
    if (historyIndex < history.length - 1) {
      isUndoRedoOperation.current = true;
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      console.log('➡️ Redoing to index:', newIndex, {
        experienceCount: nextState.work_experience?.length,
        educationCount: nextState.education?.length
      });
      
      setHistoryIndex(newIndex);
      // Create a new object to force re-render
      setLocalResume({ ...nextState });
      
      setTimeout(() => {
        isUndoRedoOperation.current = false;
        console.log('➡️ Redo operation complete');
      }, 0);
    } else {
      console.log('➡️ Cannot redo: at end of history');
    }
  }, [historyIndex, history]);
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd && event.shiftKey && event.key === 'Z') {
        // Ctrl+Shift+Z or Cmd+Shift+Z for redo
        event.preventDefault();
        handleRedo();
      } else if (isCtrlOrCmd && event.key === 'z') {
        // Ctrl+Z or Cmd+Z for undo
        event.preventDefault();
        handleUndo();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

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
      setLastSavedResume(localResume);
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
        .then((data) => {
          setAnalysis(data);
          // Initialize dismissed set with all already fixed points from backend
          const alreadyFixed = new Set<string>();
          data.sections.forEach((section: any) => {
            section.improvement_points.forEach((point: any) => {
              if (point.is_fixed) {
                alreadyFixed.add(point.id);
              }
            });
          });
          setDismissedPointIds(alreadyFixed);
        })
        .catch((error) => {
          console.error('Error loading analysis:', error);
          setAnalysis(null);
        });
    }
  }, [resume]);

  // Recalculate score dynamically based on dismissed points
  const recalculateScore = (baseAnalysis: any, dismissedIds: Set<string>) => {
    if (!baseAnalysis) return null;
    
    // Calculate total penalty from dismissed points
    let totalDismissedPenalty = 0;
    baseAnalysis.sections.forEach((section: any) => {
      section.improvement_points.forEach((point: any) => {
        if (dismissedIds.has(point.id)) {
          totalDismissedPenalty += point.score_impact || 0;
        }
      });
    });
    
    // New score = old score + recovered penalty (but cap at 100)
    const newScore = Math.min(100, baseAnalysis.score + totalDismissedPenalty);
    
    // Determine new label based on score
    let newLabel = 'Weak';
    let newSubtitle = "Let's work on it!";
    if (newScore >= 90) {
      newLabel = 'Excellent';
      newSubtitle = 'Outstanding resume!';
    } else if (newScore >= 80) {
      newLabel = 'Strong';
      newSubtitle = 'Almost perfect!';
    } else if (newScore >= 60) {
      newLabel = 'Good';
      newSubtitle = 'Looking solid!';
    } else if (newScore >= 40) {
      newLabel = 'Fair';
      newSubtitle = "You're on the right track!";
    }
    
    return {
      ...baseAnalysis,
      score: newScore,
      label: newLabel,
      subtitle: newSubtitle,
    };
  };

  // Handle fix marked - recalculate score dynamically without reloading
  const handleFixMarked = async (pointId: string) => {
    try {
      // Mark as fixed in backend
      await analysisApi.markFixed(pointId, true);
      
      // Add to dismissed set and recalculate score locally
      const newDismissedIds = new Set(dismissedPointIds);
      newDismissedIds.add(pointId);
      setDismissedPointIds(newDismissedIds);
      
      // Recalculate score dynamically
      if (analysis) {
        const updatedAnalysis = recalculateScore(analysis, newDismissedIds);
      setAnalysis(updatedAnalysis);
      }
    } catch (error) {
      console.error('Error marking fix:', error);
    }
  };

  // Refresh analysis handler
  const handleRefreshAnalysis = async () => {
    if (!resume) return;
    
    setIsRefreshingAnalysis(true);
    try {
      const newAnalysis = await analysisApi.refreshAnalysis();
      setAnalysis(newAnalysis);
      // Re-initialize dismissed points with fixed points from fresh analysis
      const alreadyFixed = new Set<string>();
      newAnalysis.sections.forEach((section: any) => {
        section.improvement_points.forEach((point: any) => {
          if (point.is_fixed) {
            alreadyFixed.add(point.id);
          }
        });
      });
      setDismissedPointIds(alreadyFixed);
    } catch (error) {
      console.error('Error refreshing analysis:', error);
    } finally {
      setIsRefreshingAnalysis(false);
    }
  };

  // Navigate to field handler
  const handleNavigateToField = (fieldPath: string) => {
    console.log('🎯 RefinePage.handleNavigateToField called:', fieldPath);
    console.log('📌 editorRef.current exists:', !!editorRef.current);
    
    // Switch to editor tab on mobile
    setMobileTab('editor');
    
    // Navigate to field in editor
    if (editorRef.current) {
      console.log('✅ Calling editorRef.current.navigateToField');
      editorRef.current.navigateToField(fieldPath);
    } else {
      console.error('❌ editorRef.current is null!');
    }
  };
  
  // Handle fix applied - update resume and add to history
  const handleFixApplied = async (updatedResume: Resume, appliedPointId?: string) => {
    handleResumeUpdate(updatedResume, true); // Add to history
    
    // If point ID provided, mark it as dismissed and recalculate score
    if (appliedPointId) {
      const newDismissedIds = new Set(dismissedPointIds);
      newDismissedIds.add(appliedPointId);
      setDismissedPointIds(newDismissedIds);
      
      if (analysis) {
        const updatedAnalysis = recalculateScore(analysis, newDismissedIds);
        setAnalysis(updatedAnalysis);
      }
    }
    
    // Auto-save to server if authenticated
    if (isAuthenticated) {
      try {
        const { resumeApi } = await import('../../shared/services/api');
        await resumeApi.updateResume(updatedResume);
        
        // Update cache and timestamp
        updateResumeInCache(updatedResume);
        setLastSavedResume(updatedResume);
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        setLastSaveTime(`${hours}:${minutes}:${seconds}`);
      } catch (error) {
        console.error('Error auto-saving resume:', error);
      }
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

  const handleTabChange = (tab: 'resumes' | 'ai-writer' | 'editor' | 'build' | 'analyze' | 'export') => {
    switch (tab) {
      case 'build':
        navigate('/build');
        break;
      case 'analyze':
        // Already on analyze page
        break;
      case 'export':
        navigate('/export');
        break;
      case 'resumes':
      case 'ai-writer':
      case 'editor':
        // Legacy tabs - ignore or redirect
        break;
    }
  };

  // If loading (auth or resume), show indicator
  if (authLoading || loading) {
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
        currentTab="analyze"
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
            display: { xs: mobileTab === 'analysis' ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Fixed Score bar with Re-analyze button */}
            <Box sx={{ 
              flexShrink: 0,
              bgcolor: '#F5F7FA',
              zIndex: 5
            }}>
              {/* Score bar */}
              {analysis && (
                <Box sx={{ pt: 2, px: 2, pb: 1 }}>
                  <ScoreBar
                    score={analysis.score}
                    label={analysis.label}
                    subtitle={analysis.subtitle}
                    marketingText={marketingText}
                    onRefresh={handleRefreshAnalysis}
                    isRefreshing={isRefreshingAnalysis}
                  />
                </Box>
              )}
            </Box>

            {/* Scrollable improvement sections */}
            <Box sx={{ 
              flex: 1,
              overflow: 'auto'
            }}>
              <ImprovementSections 
                sections={analysis?.sections || []} 
                resume={localResume || resume}
                onFixApplied={handleFixApplied}
                onNavigateToField={handleNavigateToField}
                onFixMarked={handleFixMarked}
                dismissedPointIds={dismissedPointIds}
                isPremium={user?.is_premium || false}
              />
            </Box>

            {/* Fixed bottom bar with Export button */}
            <Box sx={{
              flexShrink: 0,
              backgroundColor: 'white',
              borderTop: `1px solid ${COLORS.resume.section.border}`,
              padding: '16px',
              boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
              zIndex: 10
            }}>
              <button
                onClick={handleNext}
                style={{
                  width: '100%',
                  backgroundColor: COLORS.button.primary.background,
                  color: COLORS.button.primary.text,
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.button.primary.backgroundHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.button.primary.background;
                }}
              >
                Select Template
                <ArrowForwardIcon sx={{ fontSize: '18px' }} />
              </button>
            </Box>
          </Box>
          {/* Right column: Editor accordions */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0, 
            position: 'relative',
            display: { xs: mobileTab === 'editor' ? 'block' : 'none', md: 'block' },
            overflow: 'auto'
          }}>
            <EditorAccordion 
              ref={editorRef}
              resume={localResume || resume} 
              onResumeUpdate={handleResumeUpdate} 
            />
          
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
                    <CircularProgress size={14} thickness={4} sx={{ color: COLORS.primary.main }} />
                  </Fade>
                ) : hasUnsavedChanges ? (
                  <Zoom in={!isSaving} timeout={400}>
                    <CircleIcon 
                      sx={{ 
                        width: '8px', 
                        height: '8px', 
                        color: '#f59e0b',
                      }} 
                    />
                  </Zoom>
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
                {hasUnsavedChanges ? 'Unsaved changes' : `All changes saved at ${lastSaveTime}`}
              </Typography>
              <button 
                onClick={handleSaveNow}
                disabled={isSaving}
                style={{
                  backgroundColor: isSaving ? COLORS.button.primary.backgroundDisabled : COLORS.button.secondary.background,
                  color: isSaving ? COLORS.button.primary.textDisabled : COLORS.button.secondary.text,
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  textTransform: 'none',
                  transition: 'background-color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = COLORS.button.secondary.backgroundHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = COLORS.button.secondary.background;
                  }
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