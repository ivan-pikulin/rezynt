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
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '10px',
      transform: `scale(${scale})`,
      transformOrigin: 'center center'
    }}>
      {templateElement}
    </Box>
  );
};

export default ResumeRenderer; 