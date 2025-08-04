import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateIcon from '@mui/icons-material/Create';
import { useNavigate } from 'react-router-dom';
import { startApi } from '../startApi';

const StartOptions: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartFromScratch = async () => {
    try {
      await startApi.startFromScratch();
      navigate('/chat');
    } catch (error) {
      console.error('Failed to start from scratch:', error);
    }
  };

  const handleUploadResume = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await startApi.uploadResume(file);
        navigate('/chat');
      } catch (error) {
        console.error('Failed to upload resume:', error);
      }
    }
  };

  return (
    <>
      {/* Скрытый input для загрузки файлов */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        style={{ display: 'none' }}
      />
      
      <Box sx={{ 
        display: 'flex', 
        gap: 4, 
        maxWidth: 800,
        width: '100%'
      }}>
      {/* Start from Scratch */}
      <Card 
        sx={{ 
          flex: 1,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
        onClick={handleStartFromScratch}
      >
        <CardContent sx={{ 
          textAlign: 'center', 
          p: 4,
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CreateIcon sx={{ 
            fontSize: 64, 
            color: '#1976d2',
            mb: 2
          }} />
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Start from Scratch
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Create your resume from the beginning with AI assistance
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>

      {/* Upload Resume */}
      <Card 
        sx={{ 
          flex: 1,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
        onClick={handleUploadResume}
      >
        <CardContent sx={{ 
          textAlign: 'center', 
          p: 4,
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CloudUploadIcon sx={{ 
            fontSize: 64, 
            color: '#2e7d32',
            mb: 2
          }} />
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Upload Your Resume
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Upload your existing resume and let AI enhance it
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#2e7d32',
              '&:hover': {
                bgcolor: '#1b5e20'
              }
            }}
          >
            Upload File
          </Button>
        </CardContent>
      </Card>
    </Box>
    </>
  );
};

export default StartOptions; 