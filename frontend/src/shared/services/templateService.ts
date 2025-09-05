import { TEMPLATE_CONFIGS, TemplateConfig } from '../components/templates';
import { ResumeData } from '../types/resume';

/**
 * Сервис для работы с шаблонами резюме
 */
export class TemplateService {
  /**
   * Получить все доступные шаблоны
   */
  static getTemplates(): TemplateConfig[] {
    return Object.values(TEMPLATE_CONFIGS);
  }

  /**
   * Получить шаблон по ID
   */
  static getTemplateById(id: string): TemplateConfig | undefined {
    const template = TEMPLATE_CONFIGS[id];
    if (!template) {
      console.warn('🎨 [TemplateService] Template not found for ID:', id);
    }
    return template;
  }

  /**
   * Получить шаблоны по категории
   */
  static getTemplatesByCategory(category: string): TemplateConfig[] {
    return Object.values(TEMPLATE_CONFIGS).filter(template => template.category === category);
  }



  /**
   * Валидация данных резюме
   */
  static validateResumeData(data: ResumeData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check personal information
    if (!data.first_name) errors.push('First name is required');
    if (!data.last_name) errors.push('Last name is required');
    if (!data.location) errors.push('Location is required');

    // Check contacts
    if (!data.contacts || data.contacts.length === 0) {
      errors.push('At least one contact is required');
    }

    // Check professional summary
    if (!data.professional_summary) errors.push('Professional summary is required');

    // Check skills
    if (!data.skills || data.skills.length === 0) {
      errors.push('At least one skill is required');
    }

    // Check experience
    if (!data.experience || data.experience.length === 0) {
      errors.push('At least one experience entry is required');
    }

    // Check education
    if (!data.education || data.education.length === 0) {
      errors.push('At least one education entry is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 