import React, { useMemo } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  Paper,
  LinearProgress,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const {
    state,
    updateField,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoBack,
    getNextStepLabel,
    getProgress,
    clearBuilder,
  } = useBuilder();

  const currentStepIndex = BUILDER_STEPS.findIndex(s => s.id === state.currentStep);

  // Prepare custom steps for Header
  const customSteps = useMemo(() => 
    BUILDER_STEPS.map(step => t(`builder.steps.${step.id}`)),
    [t]
  );

  const handleStepClick = (stepIndex: number) => {
    const step = BUILDER_STEPS[stepIndex];
    if (step) {
      goToStep(step.id);
    }
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
      
      // Clear localStorage after successful save
      clearBuilder();
      
      // Navigate to refine page
      navigate('/refine');
    } catch (error) {
      console.error('Error saving resume from builder:', error);
      // Still navigate even if save fails (data is in localStorage)
      navigate('/refine');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.grey[50] }}>
      <Header 
        activeStep={currentStepIndex}
        customSteps={customSteps}
        onStepClick={handleStepClick}
        allowFirstStepClick={true}
        hideNavigationArrows={true}
        showBackButton={false}
        showNextButton={false}
      />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {/* Left Side - Form */}
          <Box sx={{ flex: 1 }}>
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                minHeight: '500px',
              }}
            >
              {renderStepContent()}

              {/* Navigation Buttons */}
              <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${COLORS.common.border}`,
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
                      {t('builder.navigation.next')}: {getNextStepLabel()}
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
                        backgroundColor: COLORS.success.main,
                        '&:hover': {
                          backgroundColor: COLORS.success.dark,
                        },
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
              position: 'sticky',
              top: 80,
              display: { xs: 'none', lg: 'block' },
            }}
          >
            {/* Tips Button */}
            <Button
              variant="contained"
              startIcon={<LightbulbIcon />}
              fullWidth
              sx={{ 
                mb: 2,
                borderRadius: '8px',
                textTransform: 'none',
                backgroundColor: COLORS.secondary.main,
                '&:hover': {
                  backgroundColor: COLORS.secondary.dark,
                },
              }}
            >
              {t('builder.preview.tips')}
            </Button>

            {/* Resume Preview */}
            <Paper 
              sx={{ 
                p: 2,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                mb: 2,
                maxHeight: 'calc(100vh - 280px)',
                overflow: 'auto',
              }}
            >
              <Box 
                sx={{ 
                  transform: 'scale(0.4)',
                  transformOrigin: 'top left',
                  width: '250%',
                  height: '1000px',
                  pointerEvents: 'none',
                }}
              >
                <ResumeRenderer data={state} templateId="nume" />
              </Box>
            </Paper>

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: COLORS.resume.text.secondary }}>
                  {t('builder.preview.progress')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {getProgress()}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getProgress()} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: COLORS.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: COLORS.success.main,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            {/* Preview Button */}
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              fullWidth
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                backgroundColor: COLORS.secondary.main,
                '&:hover': {
                  backgroundColor: COLORS.secondary.dark,
                },
              }}
            >
              {t('builder.preview.preview')}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default BuilderPage;

