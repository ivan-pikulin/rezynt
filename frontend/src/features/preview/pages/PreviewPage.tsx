import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import ResumeTemplate from '../components/ResumeTemplate';
import { useTemplate } from '../hooks/useTemplate';

const PreviewPage: React.FC = () => {
  const {
    resumeData,
    selectedTemplateId,
    error,
    validateData,
    resetToDemo,
    clearError
  } = useTemplate();

  const handleExport = async () => {
    if (!validateData()) {
      return;
    }
    
    try {
      // Здесь будет логика экспорта
      console.log('Exporting resume...');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <Box sx={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h4" component="h1">
            Resume Preview
          </Typography>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <Button 
              variant="outlined" 
              onClick={resetToDemo}
            >
              Reset to Demo
            </Button>
            <Button 
              variant="contained" 
              onClick={handleExport}
              disabled={!validateData()}
            >
              Export PDF
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ marginBottom: '20px' }}
          >
            {error}
          </Alert>
        )}

        {/* Resume Preview */}
        <Box sx={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <ResumeTemplate 
            data={resumeData}
            templateId={selectedTemplateId}
            isPreview={true}
            onExport={handleExport}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PreviewPage; 