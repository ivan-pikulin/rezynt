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

const StartOptions: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [messageOpacity, setMessageOpacity] = useState(1);
  
  // Список сообщений для отображения во время загрузки
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
  

  
  // Эффект для ротации сообщений во время загрузки
  useEffect(() => {
    if (!isUploading) {
      setUploadMessage('');
      setMessageOpacity(1);
      return;
    }
    
    // Перемешиваем сообщения в случайном порядке
    const shuffledMessages = [...uploadMessages].sort(() => Math.random() - 0.5);
    let messageIndex = 0;
    
    // Показываем первое сообщение сразу
    setUploadMessage(shuffledMessages[0]);
    messageIndex = 1;
    
    const updateMessage = () => {
      // Плавно скрываем текущее сообщение
      setMessageOpacity(0);
      
      // Через 300ms показываем новое сообщение
      setTimeout(() => {
        setUploadMessage(shuffledMessages[messageIndex]);
        setMessageOpacity(1);
        messageIndex = (messageIndex + 1) % shuffledMessages.length;
      }, 300);
    };
    
    // Интервал для смены сообщений (3-4.5 секунд)
    const interval = setInterval(() => {
      updateMessage();
    }, Math.random() * 1500 + 3000); // 3000-4500ms
    
    return () => {
      clearInterval(interval);
    };
  }, [isUploading, uploadMessages]);
  
  const handleStartFromScratch = async () => {
    if (isCreating) return;
    
    console.log('handleStartFromScratch called');
    setIsCreating(true);
    try {
      const result = await startApi.startFromScratch();
      console.log('startFromScratch result:', result);
      navigate(`/chat?resume_id=${result.id}`);
    } catch (error) {
      console.error('Failed to start from scratch:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadResume = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!isUploading) {
      setIsUploading(true);
      try {
        const result = await startApi.uploadResume(file);
        navigate(`/chat?resume_id=${result.id}`);
      } catch (error) {
        console.error('Failed to upload resume:', error);
        // Можно добавить уведомление пользователю об ошибке
      } finally {
        setIsUploading(false);
      }
    }
    // Сбрасываем input для возможности повторной загрузки того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          cursor: isCreating ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          minHeight: { xs: 160, sm: 200, md: 250 }, // Уменьшаем высоту карточек
          opacity: isCreating ? 0.7 : 1,
          '&:hover': {
            transform: { xs: 'none', md: isCreating ? 'none' : 'translateY(-4px)' }, // Отключаем hover на мобильных
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: isCreating ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          },
          '&:active': {
            transform: { xs: 'scale(0.98)', md: isCreating ? 'none' : 'translateY(-4px)' }, // Touch feedback на мобильных
            boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: isCreating ? '0 1px 4px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }
        }}
        onClick={isCreating ? undefined : handleStartFromScratch}
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
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Уменьшаем размер шрифта
            }}
          >
            {isCreating ? 'Creating Resume...' : 'Start from Scratch'}
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
            {isCreating ? 'Setting up your new resume...' : 'Create your resume from the beginning with AI assistance'}
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            disabled={isCreating}
            sx={{
              borderRadius: '8px',
              px: { xs: 2.5, sm: 3, md: 4 }, // Уменьшаем горизонтальные отступы
              py: { xs: 1, sm: 1.25, md: 1.5 }, // Уменьшаем вертикальные отступы
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: COLORS.primary.main,
              minHeight: { xs: 40, sm: 44, md: 48 }, // Уменьшаем минимальную высоту
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
          minHeight: { xs: 160, sm: 200, md: 250 }, // Уменьшаем высоту карточек
          opacity: isUploading ? 0.7 : 1,
          '&:hover': {
            transform: { xs: 'none', md: isUploading ? 'none' : 'translateY(-4px)' }, // Отключаем hover на мобильных
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: isUploading ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          },
          '&:active': {
            transform: { xs: 'scale(0.98)', md: isUploading ? 'none' : 'translateY(-4px)' }, // Touch feedback на мобильных
            boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: isUploading ? '0 1px 4px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
          }
        }}
        onClick={isUploading ? undefined : handleUploadResume}
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
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Уменьшаем размер шрифта
            }}
          >
            {isUploading ? 'Processing Resume...' : 'Upload Your Resume'}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mb: { xs: 1.5, sm: 2, md: 3 },
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }, // Уменьшаем размер шрифта
              lineHeight: { xs: 1.3, sm: 1.4, md: 1.5 }, // Уменьшаем межстрочный интервал
              minHeight: { xs: '2.6rem', sm: '2.8rem', md: '3rem' }, // Фиксированная высота для предотвращения прыжков
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              opacity: isUploading ? messageOpacity : 1,
              transition: 'opacity 0.3s ease-in-out'
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
              px: { xs: 2.5, sm: 3, md: 4 }, // Уменьшаем горизонтальные отступы
              py: { xs: 1, sm: 1.25, md: 1.5 }, // Уменьшаем вертикальные отступы
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: COLORS.upload.main,
              minHeight: { xs: 40, sm: 44, md: 48 }, // Уменьшаем минимальную высоту
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
    </>
  );
};

export default StartOptions; 