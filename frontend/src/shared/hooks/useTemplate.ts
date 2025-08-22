import { useState, useEffect } from 'react';
import { TemplateConfig } from '../types/resume';
import { TemplateService } from '../services/templateService';

const TEMPLATE_STORAGE_KEY = 'selected_resume_template';

export const useTemplate = (resumeId?: string | null) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(() => {
    // Инициализируем из localStorage или используем дефолтный шаблон
    if (resumeId) {
      const stored = localStorage.getItem(`${TEMPLATE_STORAGE_KEY}_${resumeId}`);
      if (stored) {
        try {
          const template = JSON.parse(stored);
          return TemplateService.getTemplateById(template.id) || TemplateService.getTemplates()[0];
        } catch (error) {
          console.error('Error parsing stored template:', error);
        }
      }
    }
    return TemplateService.getTemplates()[0];
  });

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    if (resumeId && selectedTemplate) {
      localStorage.setItem(`${TEMPLATE_STORAGE_KEY}_${resumeId}`, JSON.stringify(selectedTemplate));
    }
  }, [selectedTemplate, resumeId]);

  // Функция для обновления шаблона
  const updateTemplate = (template: TemplateConfig) => {
    setSelectedTemplate(template);
  };

  // Функция для сброса к дефолтному шаблону
  const resetTemplate = () => {
    const defaultTemplate = TemplateService.getTemplates()[0];
    setSelectedTemplate(defaultTemplate);
  };

  return {
    selectedTemplate,
    updateTemplate,
    resetTemplate
  };
}; 