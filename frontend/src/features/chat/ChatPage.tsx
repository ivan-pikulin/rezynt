import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ChatWindow from './components/ChatWindow';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { useTemplate } from '../../shared/hooks/useTemplate';
import { useUser } from '../../shared/hooks';
import { convertApiResumeToResumeData } from '../../shared/utils/resumeDataConverter';
import { COLORS } from '../../shared/theme/theme';
import { useMediaQuery } from '@mui/material';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');
  const { resume: resumeData, refreshResume } = useResumeQuery(resumeId);
  const { selectedTemplate } = useTemplate(resumeId, resumeData?.template_slug);
  const { user } = useUser();
  const [showPreview, setShowPreview] = useState(false);

  // Define mobile mode for screens up to 768px
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleNext = () => {
    navigate(`/refine?resume_id=${resumeId}`);
  };

  const handleBack = () => {
    navigate('/resumes');
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start
        navigate('/');
        break;
      case 1: // Generate - already on this page
        break;
      case 2: // Refine
        navigate(`/refine?resume_id=${resumeId}`);
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
        // Already on AI Writer page
        break;
      case 'editor':
        navigate(`/refine?resume_id=${resumeId}`);
        break;
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

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
        nextButtonText="Refine"
        previousButtonText="Resumes"
        showLogo={true} // Show logo on desktop
        showBackButton={true} // Show back button on chat page
        onStepClick={handleStepClick}
        isProUser={user?.is_premium}
        currentTab="ai-writer"
        onTabChange={handleTabChange}
      />

      {/* Main area */}
      <Box sx={{
        flex: 1,
        minHeight: 0, // Important for proper flex operation
        display: 'flex',
        p: isMobile ? 1 : 2, // Reduce padding on mobile
        gap: isMobile ? 0 : 2, // Remove gaps between elements on mobile
        alignItems: 'stretch',
        justifyContent: 'center'
      }}>
        {/* Main container with rounded corners */}
        <Box sx={{
          width: isMobile ? '100%' : '95%', // Full width on mobile
          height: '100%',
          bgcolor: 'white',
          borderRadius: isMobile ? 0 : '8px', // Remove rounding on mobile
          boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)', // Remove shadow on mobile
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Eye button moved into ChatWindow header on mobile */}

          {/* Left+center part: chat */}
          <Box sx={{
            flex: 1, // Take all available space
            minWidth: 0,
            minHeight: 0, // Important for proper flex operation
            p: isMobile ? 1 : 2, // Reduce padding on mobile
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // Prevent overflow
          }}>
            <ChatWindow
              resumeId={resumeId}
              onResumeUpdate={refreshResume}
              fromUpload={resumeData?.from_upload || false}
              onTogglePreview={togglePreview}
            />
          </Box>

          {/* Right part: preview (hidden on mobile by default) */}
          <Box sx={{
            width: isMobile ? 0 : '400px',
            display: isMobile ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            position: 'relative'
          }}>
            {resumeData && (
              <ResumeRenderer
                data={convertApiResumeToResumeData(resumeData)}
                scale={0.35}
                templateId={selectedTemplate?.id}
              />
            )}
            {/* Circular edit button in top-right corner over preview (desktop) */}
            {!isMobile && (
              <IconButton
                onClick={() => navigate(`/refine?resume_id=${resumeId}`)}
                sx={{
                  position: 'absolute',
                  top: 40,
                  right: 16,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  zIndex: 10,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* Side panel with preview (full screen) */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'white',
        zIndex: 1000,
        display: isMobile ? (showPreview ? 'flex' : 'none') : 'none', // Show only on mobile
        flexDirection: 'column',
        transform: isMobile ? (showPreview ? 'translateX(0)' : 'translateX(100%)') : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        overflow: 'hidden'
      }}>
        {/* Panel header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${COLORS.chat.input.border}`,
          bgcolor: COLORS.chat.input.background
        }}>
          <Box sx={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.chat.input.text }}>
            Resume Preview
          </Box>
          <IconButton
            onClick={togglePreview}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Panel content */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          overflow: 'auto'
        }}>
          {resumeData && (
            <Box sx={{ position: 'relative' }}>
              <ResumeRenderer
                data={convertApiResumeToResumeData(resumeData)}
                scale={0.4}
                fitToContainer={false}
                templateId={selectedTemplate?.id}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage; 