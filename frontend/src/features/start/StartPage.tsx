import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import StartOptions from './components/StartOptions';
import { useUser } from '../../shared/hooks';
import { COLORS } from '../../shared/theme/theme';
import PaywallModal from '../../shared/components/PaywallModal';
import { useResumes } from '../resumes/hooks/useResumes';
import { resumeApi } from '../../shared/services/api';
import GradientSpinnerAnimation from '../../shared/components/GradientSpinnerAnimation';

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const { resumes, isLoading: resumesLoading } = useResumes();
  const [showPaywall, setShowPaywall] = React.useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasResumes = Array.isArray(resumes) && resumes.length > 0;

  // List of messages to display during upload processing
  const uploadMessages = [
    "We are extracting your strengths and achievements...",
    "Optimizing your resume for ATS systems...",
    "Analyzing your experience with AI precision...",
    "Enhancing your professional summary...",
    "Identifying key skills and competencies...",
    "Structuring your resume for maximum impact...",
    "Applying industry best practices...",
    "Creating a compelling narrative...",
    "Optimizing content for recruiters...",
    "Ensuring your resume stands out...",
    "Extracting contact information...",
    "Organizing your work history...",
    "Highlighting your achievements...",
    "Preparing for AI-powered enhancement...",
    "Setting up your personalized resume..."
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
          
          if (result.status === 'completed' && result.resume_id) {
            // Success - navigate to chat
            clearInterval(interval);
            setIsProcessingUpload(false);
            setUploadError(null);
            navigate(`/chat?resume_id=${result.resume_id}`, { replace: true });
          } else if (result.status === 'error' || result.state === 'FAILURE') {
            // Error - stop processing and show error
            clearInterval(interval);
            setIsProcessingUpload(false);
            setTaskId(null);
            setUploadError(result.error || result.message || 'Failed to process resume');
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

  // Redirect logic for registered free users with resumes
  useEffect(() => {
    // Only redirect if we have all the necessary data and not processing upload
    if (user && resumes && !resumesLoading && !isProcessingUpload) {
      const isRegistered = user.is_registered;
      const isFreeUser = !user.is_premium;
      const hasResumes = Array.isArray(resumes) && resumes.length > 0;
      
      // If user is registered, on free plan, and has resumes, redirect to chat with first resume
      if (isRegistered && isFreeUser && hasResumes) {
        const firstResume = resumes[0];
        navigate(`/chat?resume_id=${firstResume.id}`, { replace: true });
      }
    }
  }, [user, resumes, resumesLoading, navigate, isProcessingUpload]);

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
              case 0: // Start - already on this page
        break;
      case 1: // Generate
        navigate('/chat');
        break;
      case 2: // Refine
        navigate('/refine');
        break;
      case 3: // Export
        navigate('/export');
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
        navigate('/chat');
        break;
      case 'editor':
        navigate('/refine');
        break;
    }
  };

  const guardStartFromScratch = () => {
    if (hasResumes) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  const guardUploadResume = () => {
    if (hasResumes) {
      setShowPaywall(true);
      return false;
    }
    return true;
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
      />
      
              {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
                  p: { xs: 2, sm: 3, md: 4 }, // Adaptive padding
                  py: { xs: 3, sm: 4, md: 6 }, // Additional vertical padding
          minHeight: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 80px)' } // Account for header height
      }}>
        <StartOptions 
          onGuardStartFromScratch={guardStartFromScratch}
          onGuardUploadResume={guardUploadResume}
          isProcessingUpload={isProcessingUpload}
          uploadMessage={uploadMessage}
          uploadError={uploadError}
          onClearError={() => setUploadError(null)}
          isStartFromScratchDisabled={!!taskId}
        />
      </Box>
      <PaywallModal 
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => setShowPaywall(false)}
      />
    </Box>
  );
};

export default StartPage; 