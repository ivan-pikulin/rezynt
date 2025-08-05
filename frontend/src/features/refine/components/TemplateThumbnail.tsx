import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import ResumeRenderer from '../../../shared/components/ResumeRenderer';
import { TemplateConfig } from '../../../shared/types/resume';

interface TemplateThumbnailProps {
  template: TemplateConfig;
  resumeData: any;
  isSelected?: boolean;
  onSelect?: () => void;
}

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ 
  template, 
  resumeData, 
  isSelected = false, 
  onSelect 
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', m: 0 }}>
      {/* Карточка с шаблоном */}
      <Card 
        onClick={onSelect}
        sx={{
          p: 0,
          m: 0,
          cursor: 'pointer',
          aspectRatio: '1/1.414',
          transition: 'all 0.2s ease',
          border: isSelected ? '2px solid #1976d2' : '2px solid transparent',
          bgcolor: isSelected ? 'rgba(25, 118, 210, 0.04)' : 'white',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            borderColor: '#1976d2',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Box sx={{ 
          width: '100%',
          maxWidth: '140px',
          aspectRatio: '1/1.414',
          padding: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: '#fafafa',
        }}>
          <ResumeRenderer
            data={resumeData} 
            templateId={template.id}
            scale={0.15}
          />
        </Box>
      </Card>
      <Typography 
        variant="caption"
        sx={{ 
          fontWeight: 500,
          color: '#2c3e50',
          textAlign: 'center',
          mt: 1,
          fontSize: '0.75rem',
          lineHeight: 1.2
        }}
      >
        {template.name}
      </Typography>
    </Box>
  );
};

export default TemplateThumbnail; 