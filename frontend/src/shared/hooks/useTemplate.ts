import { useState, useEffect } from 'react';
import { TemplateConfig } from '../types/resume';
import { TemplateService } from '../services/templateService';

const TEMPLATE_STORAGE_KEY = 'selected_resume_template';

export const useTemplate = (resumeId?: string | null, resumeTemplateSlug?: string | null) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(() => {
    // Инициализируем из localStorage или используем template_slug из резюме или дефолтный шаблон
    if (resumeId) {
      const stored = localStorage.getItem(`${TEMPLATE_STORAGE_KEY}_${resumeId}`);
      
      if (stored) {
        try {
          const template = JSON.parse(stored);
          const foundTemplate = TemplateService.getTemplateById(template.id);
          return foundTemplate || TemplateService.getTemplates()[0];
        } catch (error) {
          console.error('🎨 [useTemplate] Error parsing stored template:', error);
        }
      }
    }
    
    // Если есть template_slug из резюме, используем его
    if (resumeTemplateSlug) {
      const template = TemplateService.getTemplateById(resumeTemplateSlug);
      if (template) {
        return template;
      }
    }
    
    return TemplateService.getTemplates()[0];
  });

  // Обновляем шаблон при изменении template_slug из резюме
  useEffect(() => {
    if (resumeTemplateSlug && resumeTemplateSlug !== selectedTemplate?.id) {
      const template = TemplateService.getTemplateById(resumeTemplateSlug);
      
      if (template) {
        setSelectedTemplate(template);
      } else {
        console.warn('🎨 [useTemplate] Template not found for slug:', resumeTemplateSlug);
      }
    }
  }, [resumeTemplateSlug, selectedTemplate?.id]);

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