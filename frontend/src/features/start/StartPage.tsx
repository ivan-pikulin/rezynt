import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import StartOptions from './components/StartOptions';
import { useUser } from '../../shared/hooks';
import { COLORS } from '../../shared/theme/theme';
import PaywallModal from '../../shared/components/PaywallModal';
import { useResumes } from '../resumes/hooks/useResumes';

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { resumes, isLoading: resumesLoading } = useResumes();
  const [showPaywall, setShowPaywall] = React.useState(false);

  const hasResumes = Array.isArray(resumes) && resumes.length > 0;

  // Redirect logic for registered free users with resumes
  useEffect(() => {
    // Only redirect if we have all the necessary data
    if (user && resumes && !resumesLoading) {
      const isRegistered = user.is_registered;
      const isFreeUser = !user.is_premium;
      const hasResumes = Array.isArray(resumes) && resumes.length > 0;
      
      // If user is registered, on free plan, and has resumes, redirect to chat with first resume
      if (isRegistered && isFreeUser && hasResumes) {
        const firstResume = resumes[0];
        navigate(`/chat?resume_id=${firstResume.id}`, { replace: true });
      }
    }
  }, [user, resumes, resumesLoading, navigate]);

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