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
        flexDirection: { xs: 'column', md: 'row' }, // Вертикально на мобильных, горизонтально на десктопе
        gap: { xs: 2, sm: 3, md: 4 }, // Уменьшаем отступы между карточками
        maxWidth: { xs: '100%', sm: 700, md: 800 }, // Уменьшаем максимальную ширину
        width: '100%'
      }}>
      {/* Start from Scratch */}
      <Card 
        sx={{ 
          flex: 1,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minHeight: { xs: 160, sm: 200, md: 250 }, // Уменьшаем высоту карточек
          '&:hover': {
            transform: { xs: 'none', md: 'translateY(-4px)' }, // Отключаем hover на мобильных
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: '0 8px 25px rgba(0,0,0,0.15)' }
          },
          '&:active': {
            transform: { xs: 'scale(0.98)', md: 'translateY(-4px)' }, // Touch feedback на мобильных
            boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: '0 8px 25px rgba(0,0,0,0.15)' }
          }
        }}
        onClick={handleStartFromScratch}
      >
        <CardContent sx={{ 
          textAlign: 'center', 
          p: { xs: 2.5, sm: 3, md: 4 }, // Уменьшаем отступы
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CreateIcon sx={{ 
            fontSize: { xs: 40, sm: 48, md: 56 }, // Уменьшаем размер иконки
            color: '#1976d2',
            mb: { xs: 1, sm: 1.5, md: 2 }
          }} />
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: { xs: 1, sm: 1.5, md: 2 },
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Уменьшаем размер шрифта
            }}
          >
            Start from Scratch
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mb: { xs: 1.5, sm: 2, md: 3 },
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }, // Уменьшаем размер шрифта
              lineHeight: { xs: 1.3, sm: 1.4, md: 1.5 } // Уменьшаем межстрочный интервал
            }}
          >
            Create your resume from the beginning with AI assistance
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{
              borderRadius: '8px',
              px: { xs: 2.5, sm: 3, md: 4 }, // Уменьшаем горизонтальные отступы
              py: { xs: 1, sm: 1.25, md: 1.5 }, // Уменьшаем вертикальные отступы
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#1976d2',
              minHeight: { xs: 40, sm: 44, md: 48 }, // Уменьшаем минимальную высоту
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
          minHeight: { xs: 160, sm: 200, md: 250 }, // Уменьшаем высоту карточек
          '&:hover': {
            transform: { xs: 'none', md: 'translateY(-4px)' }, // Отключаем hover на мобильных
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: '0 8px 25px rgba(0,0,0,0.15)' }
          },
          '&:active': {
            transform: { xs: 'scale(0.98)', md: 'translateY(-4px)' }, // Touch feedback на мобильных
            boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: '0 8px 25px rgba(0,0,0,0.15)' }
          }
        }}
        onClick={handleUploadResume}
      >
        <CardContent sx={{ 
          textAlign: 'center', 
          p: { xs: 2.5, sm: 3, md: 4 }, // Уменьшаем отступы
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CloudUploadIcon sx={{ 
            fontSize: { xs: 40, sm: 48, md: 56 }, // Уменьшаем размер иконки
            color: '#2e7d32',
            mb: { xs: 1, sm: 1.5, md: 2 }
          }} />
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: { xs: 1, sm: 1.5, md: 2 },
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Уменьшаем размер шрифта
            }}
          >
            Upload Your Resume
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mb: { xs: 1.5, sm: 2, md: 3 },
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }, // Уменьшаем размер шрифта
              lineHeight: { xs: 1.3, sm: 1.4, md: 1.5 } // Уменьшаем межстрочный интервал
            }}
          >
            Upload your existing resume and let AI enhance it
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{
              borderRadius: '8px',
              px: { xs: 2.5, sm: 3, md: 4 }, // Уменьшаем горизонтальные отступы
              py: { xs: 1, sm: 1.25, md: 1.5 }, // Уменьшаем вертикальные отступы
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#2e7d32',
              minHeight: { xs: 40, sm: 44, md: 48 }, // Уменьшаем минимальную высоту
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