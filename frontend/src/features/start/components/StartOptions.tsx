import React, { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateIcon from '@mui/icons-material/Create';
import { useNavigate } from 'react-router-dom';
import { startApi } from '../startApi';
import { COLORS } from '../../../shared/theme/theme';
import { useAuthContext } from '../../../shared/contexts/AuthContext';
import { guestResumeService } from '../../../shared/services/guestResumeService';
import RegistrationModal from '../../../shared/components/RegistrationModal';

interface StartOptionsProps {
  onGuardStartFromScratch?: () => boolean;
  onGuardUploadResume?: () => boolean;
}

const StartOptions: React.FC<StartOptionsProps> = ({ onGuardStartFromScratch, onGuardUploadResume }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  
  // List of messages to display during loading
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
  
      // Simple effect for message switching
  useEffect(() => {
    if (!isUploading) {
      setUploadMessage('');
      return;
    }
    
    let messageIndex = 0;
    
          // Show first message immediately
    setUploadMessage(uploadMessages[0]);
    
          // Change message every 4 seconds
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % uploadMessages.length;
      setUploadMessage(uploadMessages[messageIndex]);
    }, 4000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isUploading]);
  
  const handleStartFromScratch = async () => {
    if (onGuardStartFromScratch && !onGuardStartFromScratch()) {
      return;
    }
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      if (!isAuthenticated) {
        // Guest flow: create local resume and go to refine/chat
        guestResumeService.createOrGet();
        navigate(`/refine?resume_id=guest`);
      } else {
        const result = await startApi.startFromScratch();
        navigate(`/chat?resume_id=${result.id}`);
      }
    } catch (error) {
      console.error('Failed to start from scratch:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadResume = () => {
    if (onGuardUploadResume && !onGuardUploadResume()) {
      return;
    }
    if (!isAuthenticated) {
      setShowRegistration(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!isUploading) {
      setIsUploading(true);
      try {
        const result = await startApi.uploadResume(file);
        
        // Save startup message to localStorage for use in chat
        if (result.startupMessage) {
          localStorage.setItem(`startup_message_${result.resume.id}`, result.startupMessage);
        }
        
        navigate(`/chat?resume_id=${result.resume.id}`);
      } catch (error) {
        console.error('Failed to upload resume:', error);
        // Can add user notification about error
      } finally {
        setIsUploading(false);
      }
    }
            // Reset input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
              {/* Hidden input for file upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        style={{ display: 'none' }}
      />
      
      <Box sx={{ 
        display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, // Vertical on mobile, horizontal on desktop
                  gap: { xs: 2, sm: 3, md: 4 }, // Reduce gaps between cards
                  maxWidth: { xs: '100%', sm: 700, md: 800 }, // Reduce maximum width
        width: '100%'
      }}>
      {/* Start from Scratch */}
      <Card 
        sx={{ 
          flex: 1,
          cursor: isCreating ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          minHeight: { xs: 160, sm: 200, md: 250 }, // Reduce card height
          opacity: isCreating ? 0.7 : 1,
          '&:hover': {
            transform: { xs: 'none', md: isCreating ? 'none' : 'translateY(-4px)' }, // Disable hover on mobile
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: isCreating ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          },
          '&:active': {
            transform: { xs: 'scale(0.98)', md: isCreating ? 'none' : 'translateY(-4px)' }, // Touch feedback on mobile
            boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: isCreating ? '0 1px 4px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }
        }}
        onClick={isCreating ? undefined : handleStartFromScratch}
      >
        <CardContent sx={{ 
          textAlign: 'center', 
          p: { xs: 2.5, sm: 3, md: 4 }, // Reduce padding
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CreateIcon sx={{ 
            fontSize: { xs: 40, sm: 48, md: 56 }, // Reduce icon size
            color: COLORS.primary.main,
            mb: { xs: 1, sm: 1.5, md: 2 }
          }} />
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: { xs: 1, sm: 1.5, md: 2 },
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Reduce font size
            }}
          >
            {isCreating ? 'Creating Resume...' : 'Start from Scratch'}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mb: { xs: 1.5, sm: 2, md: 3 },
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }, // Reduce font size
              lineHeight: { xs: 1.3, sm: 1.4, md: 1.5 } // Reduce line height
            }}
          >
            {isCreating ? 'Setting up your new resume...' : 'Create your resume from the beginning with AI assistance'}
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            disabled={isCreating}
            sx={{
              borderRadius: '8px',
              px: { xs: 2.5, sm: 3, md: 4 }, // Reduce horizontal padding
              py: { xs: 1, sm: 1.25, md: 1.5 }, // Reduce vertical padding
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: COLORS.primary.main,
              minHeight: { xs: 40, sm: 44, md: 48 }, // Reduce minimum height
              '&:hover': {
                bgcolor: COLORS.primary.dark
              }
            }}
          >
            {isCreating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Get Started'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Resume */}
      <Card 
        sx={{ 
          flex: 1,
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          minHeight: { xs: 160, sm: 200, md: 250 }, // Reduce card height
          opacity: isUploading ? 0.7 : 1,
          '&:hover': {
            transform: { xs: 'none', md: isUploading ? 'none' : 'translateY(-4px)' }, // Disable hover on mobile
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: isUploading ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          },
          '&:active': {
            transform: { xs: 'scale(0.98)', md: isUploading ? 'none' : 'translateY(-4px)' }, // Touch feedback on mobile
            boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: isUploading ? '0 1px 4px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }
        }}
        onClick={isUploading ? undefined : handleUploadResume}
      >
        <CardContent sx={{ 
          textAlign: 'center', 
          p: { xs: 2.5, sm: 3, md: 4 }, // Reduce padding
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CloudUploadIcon sx={{ 
            fontSize: { xs: 40, sm: 48, md: 56 }, // Reduce icon size
            color: COLORS.upload.main,
            mb: { xs: 1, sm: 1.5, md: 2 }
          }} />
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: { xs: 1, sm: 1.5, md: 2 },
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Reduce font size
            }}
          >
            {isUploading ? 'Processing Resume...' : 'Upload Your Resume'}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mb: { xs: 1.5, sm: 2, md: 3 },
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }, // Reduce font size
              lineHeight: { xs: 1.3, sm: 1.4, md: 1.5 }, // Reduce line height
              minHeight: { xs: '2.6rem', sm: '2.8rem', md: '3rem' }, // Fixed height to prevent jumping
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            {isUploading ? uploadMessage : 'Upload your existing resume and let AI enhance it'}
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            disabled={isUploading}
            sx={{
              borderRadius: '8px',
              px: { xs: 2.5, sm: 3, md: 4 }, // Reduce horizontal padding
              py: { xs: 1, sm: 1.25, md: 1.5 }, // Reduce vertical padding
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: COLORS.upload.main,
              minHeight: { xs: 40, sm: 44, md: 48 }, // Reduce minimum height
              '&:hover': {
                bgcolor: COLORS.upload.dark
              }
            }}
          >
            {isUploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Upload File'
            )}
          </Button>
        </CardContent>
      </Card>
    </Box>
    <RegistrationModal
      open={showRegistration}
      onClose={() => setShowRegistration(false)}
      onSuccess={() => setShowRegistration(false)}
    />
    </>
  );
};

export default StartOptions; 