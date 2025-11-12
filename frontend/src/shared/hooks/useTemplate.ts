import { useState, useEffect } from 'react';
import { TemplateConfig } from '../types/resume';
import { TemplateService } from '../services/templateService';

const TEMPLATE_STORAGE_KEY = 'selected_resume_template';

export const useTemplate = (resumeId?: string | null, resumeTemplateSlug?: string | null) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(() => {
    // Initialize from localStorage or use template_slug from resume or default template
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
    } else {
      // If no resumeId, try to load from global storage
      const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      
      if (stored) {
        try {
          const template = JSON.parse(stored);
          const foundTemplate = TemplateService.getTemplateById(template.id);
          if (foundTemplate) {
            return foundTemplate;
          }
        } catch (error) {
          console.error('🎨 [useTemplate] Error parsing stored template:', error);
        }
      }
    }
    
    // If there's template_slug from resume, use it
    if (resumeTemplateSlug) {
      const template = TemplateService.getTemplateById(resumeTemplateSlug);
      if (template) {
        return template;
      }
    }
    
    return TemplateService.getTemplates()[0];
  });

  // Update template when template_slug from resume changes
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

  // Save to localStorage when changed
  useEffect(() => {
    if (selectedTemplate) {
      if (resumeId) {
        localStorage.setItem(`${TEMPLATE_STORAGE_KEY}_${resumeId}`, JSON.stringify(selectedTemplate));
      } else {
        // Save globally when no resumeId (for single resume per user architecture)
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(selectedTemplate));
      }
    }
  }, [selectedTemplate, resumeId]);

  // Function to update template
  const updateTemplate = (template: TemplateConfig) => {
    setSelectedTemplate(template);
  };

  // Function to reset to default template
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