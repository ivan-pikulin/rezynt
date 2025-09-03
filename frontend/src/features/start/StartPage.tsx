import React from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import StartOptions from './components/StartOptions';
import { useUser } from '../../shared/hooks';
import { COLORS } from '../../shared/theme/theme';

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

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
                  showLogo={true} // Show logo on desktop
          onStepClick={undefined} // Disable step clickability
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
        <StartOptions />
      </Box>
    </Box>
  );
};

export default StartPage; 