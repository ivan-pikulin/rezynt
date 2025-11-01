import React, { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateIcon from '@mui/icons-material/Create';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { startApi } from '../startApi';
import { COLORS } from '../../../shared/theme/theme';
import { useAuthContext } from '../../../shared/contexts/AuthContext';
import { guestResumeService } from '../../../shared/services/guestResumeService';
import RegistrationModal from '../../../shared/components/RegistrationModal';

interface StartOptionsProps {
  onGuardStartFromScratch?: () => boolean;
  onGuardUploadResume?: () => boolean;
  isProcessingUpload?: boolean;
  uploadMessage?: string;
  uploadError?: string | null;
  onClearError?: () => void;
  isStartFromScratchDisabled?: boolean;
}

const StartOptions: React.FC<StartOptionsProps> = ({ 
  onGuardStartFromScratch, 
  onGuardUploadResume,
  isProcessingUpload: externalIsProcessingUpload = false,
  uploadMessage: externalUploadMessage = '',
  uploadError = null,
  onClearError,
  isStartFromScratchDisabled = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  
  // Use external processing state if provided, otherwise use internal state
  const isProcessingUpload = externalIsProcessingUpload || isUploading;
  const currentUploadMessage = externalUploadMessage || uploadMessage;
  
  // List of messages to display during loading
  const uploadMessages = [
    t('start.uploadMessages.0'),
    t('start.uploadMessages.1'),
    t('start.uploadMessages.2'),
    t('start.uploadMessages.3'),
    t('start.uploadMessages.4'),
    t('start.uploadMessages.5'),
    t('start.uploadMessages.6'),
    t('start.uploadMessages.7'),
    t('start.uploadMessages.8'),
    t('start.uploadMessages.9'),
    t('start.uploadMessages.10'),
    t('start.uploadMessages.11'),
    t('start.uploadMessages.12'),
    t('start.uploadMessages.13'),
    t('start.uploadMessages.14')
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
    if (isStartFromScratchDisabled) return;
    if (onGuardStartFromScratch && !onGuardStartFromScratch()) {
      return;
    }
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      if (!isAuthenticated) {
        // Guest flow: create local resume and go to builder
        guestResumeService.createOrGet();
        navigate('/builder');
      } else {
        // User authenticated - go to builder (user has one resume)
        navigate('/builder');
      }
    } catch (error) {
      console.error('Failed to start from scratch:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadResume = () => {
    if (isProcessingUpload) return;
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
        
        navigate('/chat');
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
          cursor: (isCreating || isStartFromScratchDisabled) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          minHeight: { xs: 160, sm: 200, md: 250 }, // Reduce card height
          opacity: (isCreating || isStartFromScratchDisabled) ? 0.7 : 1,
          '&:hover': {
            transform: { xs: 'none', md: (isCreating || isStartFromScratchDisabled) ? 'none' : 'translateY(-4px)' }, // Disable hover on mobile
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: (isCreating || isStartFromScratchDisabled) ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          },
          '&:active': {
            transform: { xs: 'scale(0.98)', md: (isCreating || isStartFromScratchDisabled) ? 'none' : 'translateY(-4px)' }, // Touch feedback on mobile
            boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: (isCreating || isStartFromScratchDisabled) ? '0 1px 4px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }
        }}
        onClick={(isCreating || isStartFromScratchDisabled) ? undefined : handleStartFromScratch}
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
            {isCreating ? t('start.options.fromScratch.buttonCreating') : t('start.options.fromScratch.title')}
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
            {isCreating ? t('start.options.fromScratch.descriptionCreating') : t('start.options.fromScratch.description')}
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            disabled={isCreating || isStartFromScratchDisabled}
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
              t('start.options.fromScratch.button')
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Resume */}
      <Card 
        sx={{ 
          flex: 1,
          cursor: isProcessingUpload ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          minHeight: { xs: 160, sm: 200, md: 250 }, // Reduce card height
          opacity: isProcessingUpload ? 0.7 : 1,
          '&:hover': {
            transform: { xs: 'none', md: isProcessingUpload ? 'none' : 'translateY(-4px)' }, // Disable hover on mobile
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: isProcessingUpload ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          },
          '&:active': {
            transform: { xs: 'scale(0.98)', md: isProcessingUpload ? 'none' : 'translateY(-4px)' }, // Touch feedback on mobile
            boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: isProcessingUpload ? '0 1px 4px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }
        }}
        onClick={isProcessingUpload ? undefined : handleUploadResume}
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
            {isProcessingUpload ? t('start.options.upload.titleProcessing') : t('start.options.upload.title')}
          </Typography>
          {uploadError ? (
            <Alert 
              severity="error" 
              sx={{ 
                mb: { xs: 1.5, sm: 2, md: 3 },
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                '& .MuiAlert-message': {
                  fontSize: 'inherit'
                }
              }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={onClearError}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {uploadError}
            </Alert>
          ) : (
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
              {isProcessingUpload ? currentUploadMessage : t('start.options.upload.description')}
            </Typography>
          )}
          <Button 
            variant="contained" 
            size="large"
            disabled={isProcessingUpload}
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
            {isProcessingUpload ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t('start.options.upload.button')
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