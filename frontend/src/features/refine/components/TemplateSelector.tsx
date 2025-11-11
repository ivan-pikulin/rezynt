import Box from '@mui/material/Box';
import React, { useEffect, useState } from 'react';
import { TemplateService } from '../../../shared/services/templateService';
import { TemplateConfig } from '../../../shared/types/resume';
import TemplateThumbnail from './TemplateThumbnail';

interface TemplateSelectorProps {
  onTemplateChange?: (template: TemplateConfig) => void;
  onTemplateHover?: (template: TemplateConfig) => void;
  onTemplateHoverEnd?: () => void;
  horizontalLayout?: boolean;
  selectedTemplate?: TemplateConfig | null;
  resumeData?: any; // Real resume data for preview
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  onTemplateChange, 
  onTemplateHover, 
  onTemplateHoverEnd, 
  horizontalLayout = false, 
  selectedTemplate: externalSelectedTemplate, 
  resumeData
}) => {
  const templates = TemplateService.getTemplates();
  const [internalSelectedTemplate, setInternalSelectedTemplate] = useState<TemplateConfig | null>(
    externalSelectedTemplate || templates[0]
  );

  // Use only real resume data
  const previewData = resumeData;

  // Use external selectedTemplate if passed, otherwise internal
  const selectedTemplate = externalSelectedTemplate || internalSelectedTemplate;

  // If no resume data, don't render templates
  if (!previewData) {
    return null;
  }

  // Sync with external selectedTemplate
  useEffect(() => {
    if (externalSelectedTemplate && externalSelectedTemplate.id !== internalSelectedTemplate?.id) {
      setInternalSelectedTemplate(externalSelectedTemplate);
    }
  }, [externalSelectedTemplate, internalSelectedTemplate?.id]);

  // Call onTemplateChange when initializing with selected template
  useEffect(() => {
    if (selectedTemplate && onTemplateChange) {
      onTemplateChange(selectedTemplate);
    }
  }, []); // Empty dependency array - executed only on mount

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
              onHover={onTemplateHover}
              onHoverEnd={onTemplateHoverEnd}
              horizontal={true}
            />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Сетка шаблонов - 2x2 */}
      <Box sx={{ 
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, minmax(100px, 1fr))',
        gap: 1.5,
        overflowY: 'auto',
        p: 1,
        alignContent: 'start',
        maxHeight: 'calc(100vh - 200px)' // Ensure 2 rows fit
      }}>
        {templates.map((template) => (
          <TemplateThumbnail
            key={template.id}
            template={template}
            resumeData={previewData}
            isSelected={selectedTemplate?.id === template.id}
            onSelect={() => handleTemplateSelect(template)}
            onHover={onTemplateHover}
            onHoverEnd={onTemplateHoverEnd}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TemplateSelector; 