import React, { useState, useEffect } from 'react';
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
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(
    TemplateService.getTemplateById('tero') || templates[0]
  );

  // Вызываем onTemplateChange при инициализации с выбранным шаблоном
  useEffect(() => {
    if (selectedTemplate && onTemplateChange) {
      onTemplateChange(selectedTemplate);
    }
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

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
      
      {/* Сетка шаблонов - 2 столбца */}
      <Box sx={{ 
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1.5,
        overflowY: 'auto',
        p: 1,
        alignContent: 'start'
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