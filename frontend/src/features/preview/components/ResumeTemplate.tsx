import React from 'react';
import Box from '@mui/material/Box';
import { ResumeData } from '../../../shared/types/resume';
import { createTemplate } from './templates';

interface ResumeTemplateProps {
  data: ResumeData;
  templateId?: string;
  isPreview?: boolean;
  onExport?: () => void;
}

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ 
  data, 
  templateId = 'alder', 
  isPreview = true,
  onExport 
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
      padding: '10px'
    }}>
      {templateElement}
    </Box>
  );
};

export default ResumeTemplate; 