import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TemplateThumbnail from './TemplateThumbnail';
import { TemplateService } from '../../../shared/services/templateService';
import { TemplateConfig } from '../../../shared/types/resume';

interface TemplateSelectorProps {
  onTemplateChange?: (template: TemplateConfig) => void;
  horizontalLayout?: boolean;
  selectedTemplate?: TemplateConfig | null;
  resumeData?: any; // Реальные данные резюме для превью
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onTemplateChange, horizontalLayout = false, selectedTemplate: externalSelectedTemplate, resumeData }) => {
  const templates = TemplateService.getTemplates();
  const [internalSelectedTemplate, setInternalSelectedTemplate] = useState<TemplateConfig | null>(
    externalSelectedTemplate || templates[0]
  );

  // Используем только реальные данные резюме
  const previewData = resumeData;

  // Используем внешний selectedTemplate если он передан, иначе внутренний
  const selectedTemplate = externalSelectedTemplate || internalSelectedTemplate;

  // Если нет данных резюме, не рендерим шаблоны
  if (!previewData) {
    return null;
  }

  // Синхронизируем с внешним selectedTemplate
  useEffect(() => {
    if (externalSelectedTemplate && externalSelectedTemplate.id !== internalSelectedTemplate?.id) {
      setInternalSelectedTemplate(externalSelectedTemplate);
    }
  }, [externalSelectedTemplate, internalSelectedTemplate?.id]);

  // Вызываем onTemplateChange при инициализации с выбранным шаблоном
  useEffect(() => {
    if (selectedTemplate && onTemplateChange) {
      onTemplateChange(selectedTemplate);
    }
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

  const handleTemplateSelect = (template: TemplateConfig) => {
    setInternalSelectedTemplate(template);
    onTemplateChange?.(template);
  };

  if (horizontalLayout) {
    return (
      <Box sx={{ 
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        minHeight: 140
      }}>
        {templates.map((template) => (
          <Box key={template.id} sx={{ flexShrink: 0 }}>
            <TemplateThumbnail
              template={template}
              resumeData={previewData}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={() => handleTemplateSelect(template)}
              horizontal={true}
            />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Сетка шаблонов - 1 столбец */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        overflowY: 'auto',
        p: 1,
        alignContent: 'start'
      }}>
        {templates.map((template) => (
          <TemplateThumbnail
            key={template.id}
            template={template}
            resumeData={previewData}
            isSelected={selectedTemplate?.id === template.id}
            onSelect={() => handleTemplateSelect(template)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TemplateSelector; 