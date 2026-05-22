import React, { useMemo } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  Paper,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../shared/hooks/useAuth';
import { useUser } from '../../shared/hooks';
import { useBuilder } from './hooks/useBuilder';
import { BUILDER_STEPS } from './types/builder';
import { ContactInfoStep } from './components/ContactInfoStep';
import { WorkExperienceStep } from './components/WorkExperienceStep';
import { EducationStep } from './components/EducationStep';
import { SkillsStep } from './components/SkillsStep';
import { SummaryStep } from './components/SummaryStep';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { COLORS } from '../../shared/theme/theme';
import Header from '../../shared/components/Header/Header';

export const BuilderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const {
    state,
    updateField,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoBack,
    clearBuilder,
  } = useBuilder();

  const currentStepIndex = BUILDER_STEPS.findIndex(s => s.id === state.currentStep);

  // Prepare custom steps for Header
  const customSteps = useMemo(() => 
    BUILDER_STEPS.map(step => t(`builder.steps.${step.id}`)),
    [t]
  );
  const nextStepLabel = currentStepIndex >= 0 ? (customSteps[currentStepIndex + 1] ?? '') : '';

  const handleStepClick = (stepIndex: number) => {
    const step = BUILDER_STEPS[stepIndex];
    if (step) {
      goToStep(step.id);
    }
  };

  const getStepHeaderInfo = () => {
    // Map step IDs to translation keys
    const stepKeyMap: Record<string, string> = {
      'contact-info': 'contactInfo',
      'work-experience': 'workExperience',
      'education': 'education',
      'skills': 'skills',
      'summary': 'summary'
    };
    
    const stepKey = stepKeyMap[state.currentStep];
    return {
      title: t(`builder.${stepKey}.title`),
      description: t(`builder.${stepKey}.description`)
    };
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'contact-info':
        return <ContactInfoStep state={state} onUpdate={updateField} />;
      case 'work-experience':
        return <WorkExperienceStep state={state} onUpdate={updateField} />;
      case 'education':
        return <EducationStep state={state} onUpdate={updateField} />;
      case 'skills':
        return <SkillsStep state={state} onUpdate={updateField} />;
      case 'summary':
        return <SummaryStep state={state} onUpdate={updateField} />;
      default:
        return null;
    }
  };

  const handleFinish = async () => {
    try {
      // Save builder data to backend
      const { resumeApi } = await import('../../shared/services/api');
      await resumeApi.updateResume(state);
      
      // Update React Query cache with fresh data to prevent loading screen
      const cacheKey = isAuthenticated ? 'user' : 'guest';
      queryClient.setQueryData(['resume', cacheKey], state);
      
      // Also update guest localStorage if needed
      if (!isAuthenticated) {
        const { guestResumeService } = await import('../../shared/services/guestResumeService');
        guestResumeService.update(state);
      }
      
      // Clear localStorage after successful save
      clearBuilder();
      
      // Check if authenticated user has completed onboarding
      if (isAuthenticated && user && !user.has_completed_onboarding) {
        // Redirect to onboarding with refine as redirect target
        navigate('/onboarding?redirect=/refine');
      } else {
        // Navigate to refine page directly
        navigate('/refine');
      }
    } catch (error) {
      console.error('Error saving resume from builder:', error);
      // Still navigate even if save fails (data is in localStorage)
      navigate('/refine');
    }
  };

  const handleTabChange = (tab: 'resumes' | 'ai-writer' | 'editor' | 'build' | 'analyze' | 'export') => {
    switch (tab) {
      case 'build':
        // Navigate to build page (StartPage for premium users)
        navigate('/build');
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
        // Legacy tabs - ignore or redirect
        break;
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      backgroundColor: COLORS.grey[50],
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header 
        activeStep={currentStepIndex}
        customSteps={customSteps}
        onStepClick={handleStepClick}
        allowFirstStepClick={true}
        onNext={canGoNext() ? goToNextStep : undefined}
        onBack={canGoBack() ? goToPreviousStep : undefined}
        isProUser={user?.is_premium}
        currentTab="build"
        onTabChange={handleTabChange}
      />

      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 4,
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, width: '100%', height: '100%' }}>
          {/* Left Side - Form */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Fixed Header */}
              <Box sx={{ flexShrink: 0, mb: 3 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: COLORS.resume.text.primary,
                    fontSize: '1.5rem',
                  }}
                >
                  {getStepHeaderInfo().title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: COLORS.resume.text.secondary,
                    fontSize: '14px',
                  }}
                >
                  {getStepHeaderInfo().description}
                </Typography>
              </Box>

              {/* Scrollable Content */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {renderStepContent()}
              </Box>

              {/* Navigation Buttons */}
              <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 'auto',
                    pt: 3,
                    borderTop: `1px solid ${COLORS.common.border}`,
                    flexShrink: 0
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={goToPreviousStep}
                    disabled={!canGoBack()}
                    sx={{ 
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 3,
                    }}
                  >
                    {t('builder.navigation.back')}
                  </Button>

                  {canGoNext() ? (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={goToNextStep}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 600,
                      }}
                    >
                      {t('builder.navigation.next')}: {nextStepLabel}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleFinish}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 600,
                      }}
                    >
                      {t('builder.navigation.finish')}
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Right Side - Preview */}
          <Box 
            sx={{ 
              width: 400,
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ResumeRenderer data={state} templateId="clarity" scale={0.35} />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default BuilderPage;
