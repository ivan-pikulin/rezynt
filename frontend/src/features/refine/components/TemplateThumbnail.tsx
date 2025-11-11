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
  onHover?: (template: TemplateConfig) => void;
  onHoverEnd?: () => void;
  horizontal?: boolean;
}

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ 
  template, 
  resumeData, 
  isSelected = false, 
  onSelect,
  onHover,
  onHoverEnd,
  horizontal = false
}) => {
  if (horizontal) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
        {/* Template card */}
        <Card 
          onClick={onSelect}
          onMouseEnter={() => onHover?.(template)}
          onMouseLeave={onHoverEnd}
          sx={{
            p: 0,
            m: 0,
            cursor: 'pointer',
            width: 80,
            height: 113, // A4 proportions
            transition: 'all 0.2s ease',
            border: isSelected ? '2px solid #1976d2' : '2px solid transparent',
            bgcolor: isSelected ? 'rgba(25, 118, 210, 0.04)' : 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            '&:hover': {
              borderColor: '#1976d2',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
        >
          <Box sx={{ 
            width: '100%',
            height: '100%',
            padding: '2px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            bgcolor: '#fafafa',
          }}>
            <ResumeRenderer
              data={resumeData} 
              templateId={template.id}
              scale={0.12}
            />
          </Box>
        </Card>
        <Typography 
          variant="caption"
          sx={{ 
            fontWeight: 500,
            color: '#2c3e50',
            textAlign: 'center',
            mt: 0.5,
            fontSize: '0.7rem',
            lineHeight: 1.2,
            maxWidth: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {template.name}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', m: 0 }}>
              {/* Template card */}
      <Card 
        onClick={onSelect}
        onMouseEnter={() => onHover?.(template)}
        onMouseLeave={onHoverEnd}
        sx={{
          p: 0,
          m: 0,
          cursor: 'pointer',
          height: 'calc(100% - 20px)', // Leave space for text
          transition: 'all 0.2s ease',
          border: isSelected ? '2px solid #1976d2' : '2px solid transparent',
          bgcolor: isSelected ? 'rgba(25, 118, 210, 0.04)' : 'white',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            borderColor: '#1976d2',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Box sx={{ 
          width: '100%',
          height: '100%',
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
          mt: 0.5,
          fontSize: '0.65rem',
          lineHeight: 1.2,
          height: '18px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {template.name}
      </Typography>
    </Box>
  );
};

export default TemplateThumbnail; 