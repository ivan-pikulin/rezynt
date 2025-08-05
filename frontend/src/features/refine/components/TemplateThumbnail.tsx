import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
    <Card 
      onClick={onSelect}
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isSelected ? '2px solid #1976d2' : '2px solid transparent',
        bgcolor: isSelected ? 'rgba(25, 118, 210, 0.04)' : 'white',
        '&:hover': {
          borderColor: '#1976d2',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Название шаблона */}
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 1,
            fontWeight: 600,
            color: '#2c3e50',
            textAlign: 'center'
          }}
        >
          {template.name}
        </Typography>
        
        {/* Описание */}
        <Typography 
          variant="caption" 
          sx={{ 
            mb: 2,
            color: '#7f8c8d',
            textAlign: 'center',
            display: 'block'
          }}
        >
          {template.description}
        </Typography>
        
        {/* Миниатюра резюме */}
        <Box sx={{ 
          height: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          bgcolor: '#fafafa'
        }}>
          <ResumeRenderer 
            data={resumeData} 
            templateId={template.id}
            scale={0.15}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TemplateThumbnail; 