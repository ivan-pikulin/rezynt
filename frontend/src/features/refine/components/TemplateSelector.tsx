import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TemplateThumbnail from './TemplateThumbnail';
import { TemplateService } from '../../../shared/services/templateService';
import { TemplateConfig } from '../../../shared/types/resume';

interface TemplateSelectorProps {
  onTemplateChange?: (template: TemplateConfig) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onTemplateChange }) => {
  const templates = TemplateService.getTemplates();
  const demoData = TemplateService.createDemoData();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(templates[0]);

  const handleTemplateSelect = (template: TemplateConfig) => {
    setSelectedTemplate(template);
    onTemplateChange?.(template);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Заголовок */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3,
          fontWeight: 600,
          color: '#2c3e50',
          textAlign: 'center'
        }}
      >
        Choose Template
      </Typography>
      
      {/* Список шаблонов */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto'
      }}>
        {templates.map((template) => (
          <TemplateThumbnail
            key={template.id}
            template={template}
            resumeData={demoData}
            isSelected={selectedTemplate?.id === template.id}
            onSelect={() => handleTemplateSelect(template)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TemplateSelector; 