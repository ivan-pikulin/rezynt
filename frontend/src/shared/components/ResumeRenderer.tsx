import React from 'react';
import Box from '@mui/material/Box';
import { ResumeData } from '../types/resume';
import { createTemplate } from './templates';

interface ResumeRendererProps {
  data: ResumeData;
  templateId?: string;
  isPreview?: boolean;
  onExport?: () => void;
  scale?: number; // Добавляем поддержку масштабирования
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ 
  data, 
  templateId = 'alder', 
  isPreview = true,
  onExport,
  scale = 1
}) => {
  const templateElement = createTemplate(templateId, {
    data,
    isPreview,
    onExport
  });

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
      padding: '20px'
    }}>
      {templateElement}
    </Box>
  );
};

export default ResumeRenderer; 