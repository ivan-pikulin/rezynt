import { TEMPLATE_CONFIGS, TemplateConfig } from '../components/templates';
import { ResumeData, ExportOptions } from '../../../shared/types/resume';

/**
 * Сервис для работы с шаблонами резюме
 */
export class TemplateService {
  /**
   * Получить все доступные шаблоны
   */
  static getTemplates(): TemplateConfig[] {
    return TEMPLATE_CONFIGS;
  }

  /**
   * Получить шаблон по ID
   */
  static getTemplateById(id: string): TemplateConfig | undefined {
    return TEMPLATE_CONFIGS.find(template => template.id === id);
  }

  /**
   * Получить шаблоны по категории
   */
  static getTemplatesByCategory(category: string): TemplateConfig[] {
    return TEMPLATE_CONFIGS.filter(template => template.category === category);
  }

  /**
   * Создать демо данные для тестирования шаблонов
   */
  static createDemoData(): ResumeData {
    return {
      personalInfo: {
        firstName: 'Pikulin',
        lastName: 'Ivan',
        middleName: 'Sergeevich',
        phone: '89852799176',
        email: 'pikulin.ivan.pelikan@gmail.com',
        location: 'Moscow, Russia',
        zipCode: '400080'
      },
      professionalSummary: 'Dynamic ML Engineer with a proven track record at Abstergo, adept at optimizing data collection and visualizing complex data trends. Skilled in cloud computing and data preprocessing, I excel in presenting analytical findings and fostering strong interpersonal communication. My adaptability ensures effective collaboration and innovative solutions in fast-paced environments.',
      skills: [
        { id: '1', name: 'Cloud computing' },
        { id: '2', name: 'Enterprise resource planning software' },
        { id: '3', name: 'Interpersonal communication' },
        { id: '4', name: 'Adaptability' },
        { id: '5', name: 'Data preprocessing and cleaning' }
      ],
      experience: [
        {
          id: '1',
          jobTitle: 'ML Engineer',
          company: 'Abstergo',
          location: 'Moscow, Russia',
          startDate: '2023-01-01',
          isCurrent: true,
          responsibilities: [
            'Optimized data collection by designing instruments and applications.',
            'Visualized data trends and results with graphs and charts.',
            'Manipulated and analyzed large or complex data sets using relevant techniques.',
            'Presented findings orally and in writing to share results of mathematical analyses.',
            'Helped office personnel with errands, paperwork and data entry.'
          ]
        }
      ],
      education: [
        {
          id: '1',
          degree: 'Master of Arts (M.A.): Chemistry',
          institution: 'Moscow State University',
          location: 'Moscow',
          graduationDate: '2026-01-01'
        }
      ]
    };
  }

  /**
   * Валидация данных резюме
   */
  static validateResumeData(data: ResumeData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Проверка персональной информации
    if (!data.personalInfo.firstName) errors.push('First name is required');
    if (!data.personalInfo.lastName) errors.push('Last name is required');
    if (!data.personalInfo.phone) errors.push('Phone is required');
    if (!data.personalInfo.email) errors.push('Email is required');
    if (!data.personalInfo.location) errors.push('Location is required');

    // Проверка профессионального резюме
    if (!data.professionalSummary) errors.push('Professional summary is required');

    // Проверка навыков
    if (!data.skills || data.skills.length === 0) {
      errors.push('At least one skill is required');
    }

    // Проверка опыта
    if (!data.experience || data.experience.length === 0) {
      errors.push('At least one experience entry is required');
    }

    // Проверка образования
    if (!data.education || data.education.length === 0) {
      errors.push('At least one education entry is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 