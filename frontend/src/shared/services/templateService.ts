import { TEMPLATE_CONFIGS, TemplateConfig } from '../components/templates';
import { ResumeData } from '../types/resume';

/**
 * Service for working with resume templates
 */
export class TemplateService {
  /**
   * Get all available templates
   */
  static getTemplates(): TemplateConfig[] {
    return Object.values(TEMPLATE_CONFIGS);
  }

  /**
   * Get template by ID
   */
  static getTemplateById(id: string): TemplateConfig | undefined {
    const template = TEMPLATE_CONFIGS[id];
    if (!template) {
      console.warn('🎨 [TemplateService] Template not found for ID:', id);
    }
    return template;
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: string): TemplateConfig[] {
    return Object.values(TEMPLATE_CONFIGS).filter(template => template.category === category);
  }



  /**
   * Resume data validation (soft check - returns warnings, not blocking)
   */
  static validateResumeData(data: ResumeData, t?: (key: string) => string): { isValid: boolean; errors: string[] } {
    const warnings: string[] = [];

    // Helper function to get translated warning message
    const getWarning = (key: string, fallback: string): string => {
      return t ? t(key) : fallback;
    };

    // Soft checks for better user experience
    if (!data.personal_info?.first_name && !data.personal_info?.last_name) {
      warnings.push(getWarning('templates.validation.nameRecommended', 'Имя рекомендуется для более сильного резюме'));
    }

    if (!data.professional_summary) {
      warnings.push(getWarning('templates.validation.summaryRecommended', 'Профессиональное резюме рекомендуется'));
    }

    // All fields are optional now - always valid
    return {
      isValid: true,
      errors: warnings
    };
  }
}
