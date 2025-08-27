import { useState, useEffect } from 'react';
import { TemplateConfig } from '../types/resume';
import { TemplateService } from '../services/templateService';

const TEMPLATE_STORAGE_KEY = 'selected_resume_template';

export const useTemplate = (resumeId?: string | null, resumeTemplateSlug?: string | null) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(() => {
    console.log('🎨 [useTemplate] Initializing template selection:', {
      resumeId,
      resumeTemplateSlug,
      timestamp: new Date().toISOString()
    });

    // Инициализируем из localStorage или используем template_id из резюме или дефолтный шаблон
    if (resumeId) {
      const stored = localStorage.getItem(`${TEMPLATE_STORAGE_KEY}_${resumeId}`);
      console.log('🎨 [useTemplate] Checking localStorage:', {
        key: `${TEMPLATE_STORAGE_KEY}_${resumeId}`,
        stored: stored ? 'found' : 'not found'
      });
      
      if (stored) {
        try {
          const template = JSON.parse(stored);
          console.log('🎨 [useTemplate] Parsed stored template:', template);
          const foundTemplate = TemplateService.getTemplateById(template.id);
          console.log('🎨 [useTemplate] Template lookup result:', {
            templateId: template.id,
            found: !!foundTemplate,
            templateName: foundTemplate?.name
          });
          return foundTemplate || TemplateService.getTemplates()[0];
        } catch (error) {
          console.error('🎨 [useTemplate] Error parsing stored template:', error);
        }
      }
    }
    
    // Если есть template_slug из резюме, используем его
    if (resumeTemplateSlug) {
      console.log('🎨 [useTemplate] Using resume template_slug:', resumeTemplateSlug);
      const template = TemplateService.getTemplateById(resumeTemplateSlug);
      console.log('🎨 [useTemplate] Resume template lookup result:', {
        templateSlug: resumeTemplateSlug,
        found: !!template,
        templateName: template?.name
      });
      if (template) {
        return template;
      }
    }
    
    const defaultTemplate = TemplateService.getTemplates()[0];
    console.log('🎨 [useTemplate] Using default template:', {
      templateId: defaultTemplate?.id,
      templateName: defaultTemplate?.name
    });
    return defaultTemplate;
  });

  // Обновляем шаблон при изменении template_slug из резюме
  useEffect(() => {
    console.log('🎨 [useTemplate] useEffect triggered:', {
      resumeTemplateSlug,
      currentTemplateId: selectedTemplate?.id,
      shouldUpdate: resumeTemplateSlug && resumeTemplateSlug !== selectedTemplate?.id
    });

    if (resumeTemplateSlug && resumeTemplateSlug !== selectedTemplate?.id) {
      console.log('🎨 [useTemplate] Updating template from resume data:', {
        from: selectedTemplate?.id,
        to: resumeTemplateSlug
      });
      
      const template = TemplateService.getTemplateById(resumeTemplateSlug);
      console.log('🎨 [useTemplate] Template found for update:', {
        templateSlug: resumeTemplateSlug,
        found: !!template,
        templateName: template?.name
      });
      
      if (template) {
        setSelectedTemplate(template);
        console.log('🎨 [useTemplate] Template updated successfully');
      } else {
        console.warn('🎨 [useTemplate] Template not found for slug:', resumeTemplateSlug);
      }
    }
  }, [resumeTemplateSlug, selectedTemplate?.id]);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    if (resumeId && selectedTemplate) {
      console.log('🎨 [useTemplate] Saving template to localStorage:', {
        resumeId,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name
      });
      localStorage.setItem(`${TEMPLATE_STORAGE_KEY}_${resumeId}`, JSON.stringify(selectedTemplate));
    }
  }, [selectedTemplate, resumeId]);

  // Функция для обновления шаблона
  const updateTemplate = (template: TemplateConfig) => {
    console.log('🎨 [useTemplate] updateTemplate called:', {
      templateId: template.id,
      templateName: template.name,
      previousTemplateId: selectedTemplate?.id
    });
    setSelectedTemplate(template);
  };

  // Функция для сброса к дефолтному шаблону
  const resetTemplate = () => {
    const defaultTemplate = TemplateService.getTemplates()[0];
    console.log('🎨 [useTemplate] resetTemplate called:', {
      defaultTemplateId: defaultTemplate?.id,
      defaultTemplateName: defaultTemplate?.name
    });
    setSelectedTemplate(defaultTemplate);
  };

  return {
    selectedTemplate,
    updateTemplate,
    resetTemplate
  };
}; 