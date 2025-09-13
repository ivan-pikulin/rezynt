import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userApi, OnboardingComplete } from '../../shared/services/api/userApi';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import Header from '../../shared/components/Header/Header';

interface OnboardingStep {
  question: string;
  field: keyof OnboardingComplete['responses'];
  options: string[];
}

interface OnboardingPageProps {
  redirectUrl?: string;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ redirectUrl }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuthContext();
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState<OnboardingComplete['responses']>({
    experience: '',
    job_search_status: '',
    background_field: '',
    resume_goal: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Get task_id from URL parameters
  const taskId = searchParams.get('task_id');

  const steps: OnboardingStep[] = [
    {
      question: t('onboarding.questions.experience'),
      field: 'experience',
      options: [
        t('onboarding.options.experience.noExperience'),
        t('onboarding.options.experience.oneToTwo'),
        t('onboarding.options.experience.threeToFive'),
        t('onboarding.options.experience.sixToTen'),
        t('onboarding.options.experience.tenPlus'),
      ],
    },
    {
      question: t('onboarding.questions.jobSearch'),
      field: 'job_search_status',
      options: [
        t('onboarding.options.jobSearch.actively'),
        t('onboarding.options.jobSearch.preparing'),
        t('onboarding.options.jobSearch.exploring'),
      ],
    },
    {
      question: t('onboarding.questions.background'),
      field: 'background_field',
      options: [
        t('onboarding.options.background.tech'),
        t('onboarding.options.background.business'),
        t('onboarding.options.background.design'),
        t('onboarding.options.background.manual'),
        t('onboarding.options.background.student'),
        t('onboarding.options.background.other'),
      ],
    },
    {
      question: t('onboarding.questions.goal'),
      field: 'resume_goal',
      options: [
        t('onboarding.options.goal.betterJob'),
        t('onboarding.options.goal.changeCareer'),
        t('onboarding.options.goal.firstJob'),
        t('onboarding.options.goal.testing'),
      ],
    },
  ];

  const handleResponseChange = useCallback((field: keyof OnboardingComplete['responses'], value: string) => {
    setResponses(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, steps.length]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  }, [activeStep]);

  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await userApi.completeOnboarding({ responses });
      updateUser(result.user);
      
      // If there's a task_id, redirect to start page with it
      if (taskId) {
        navigate(`/start?task_id=${taskId}`, { replace: true });
      } else if (redirectUrl) {
        // Navigate to redirect URL if provided
        navigate(redirectUrl, { replace: true });
      } else {
        // Otherwise navigate to home
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || t('onboarding.error'));
    } finally {
      setIsLoading(false);
    }
  }, [responses, updateUser, navigate, t, redirectUrl, taskId]);

  const currentStep = steps[activeStep];
  const isCurrentStepComplete = responses[currentStep.field] !== '';
  const isAllStepsComplete = Object.values(responses).every(value => value !== '');

          // Enter key handler
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isCurrentStepComplete) {
      if (activeStep === steps.length - 1) {
        handleComplete();
      } else {
        handleNext();
      }
    }
  }, [activeStep, isCurrentStepComplete, steps.length, handleComplete, handleNext]);

          // Add keyboard handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isCurrentStepComplete) {
        if (activeStep === steps.length - 1) {
          handleComplete();
        } else {
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeStep, isCurrentStepComplete, steps.length, handleComplete, handleNext]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header 
        showSteps={false}
        showLogo={true}
        showBackButton={false}
        showNextButton={false}
        isOnboarding={true}
        onboardingTitle={t('onboarding.title')}
      />
      
      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          p: 2,
        }}
      >
        {/* Question card */}
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {currentStep.question}
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <RadioGroup
                  value={responses[currentStep.field]}
                  onChange={(e) => handleResponseChange(currentStep.field, e.target.value)}
                  onKeyDown={handleKeyPress}
                >
                  {currentStep.options.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Navigation arrows on card */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
                {/* Left Arrow - only if not first step */}
                {activeStep > 0 ? (
                  <IconButton
                    onClick={handleBack}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                ) : (
                  <Box /> // Empty element for alignment
                )}

                {/* Right Arrow */}
                <IconButton
                  onClick={activeStep === steps.length - 1 ? handleComplete : handleNext}
                  disabled={!isCurrentStepComplete || (activeStep === steps.length - 1 && !isAllStepsComplete) || isLoading}
                  sx={{
                    color: (!isCurrentStepComplete || (activeStep === steps.length - 1 && !isAllStepsComplete)) ? 'action.disabled' : 'primary.main',
                    '&:hover': {
                      color: (!isCurrentStepComplete || (activeStep === steps.length - 1 && !isAllStepsComplete)) ? 'action.disabled' : 'primary.dark',
                      backgroundColor: (!isCurrentStepComplete || (activeStep === steps.length - 1 && !isAllStepsComplete)) ? 'transparent' : 'action.hover',
                    },
                    '&:disabled': {
                      color: 'action.disabled',
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OnboardingPage;
