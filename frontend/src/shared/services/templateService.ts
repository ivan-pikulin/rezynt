import { TEMPLATE_CONFIGS, TemplateConfig } from '../components/templates';
import { ResumeData, ExportOptions } from '../types/resume';

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
        firstName: 'Elon',
        lastName: 'Musk',
        middleName: '',
        phone: '+1 (310) 363-6000',
        email: 'elon.musk@tesla.com',
        location: 'Austin, Texas, USA',
        zipCode: '78701'
      },
      professionalSummary: 'Visionary entrepreneur and engineer with over 25 years of experience revolutionizing multiple industries. Proven track record of building world-changing companies including Tesla, SpaceX, Neuralink, and The Boring Company. Expert in sustainable technology, rocket engineering, and disruptive innovation.',
      skills: [
        { id: '1', name: 'Strategic Leadership' },
        { id: '2', name: 'Electric Vehicle Engineering' },
        { id: '3', name: 'Rocket Propulsion Systems' },
        { id: '4', name: 'Artificial Intelligence' },
        { id: '5', name: 'Sustainable Energy' },
        { id: '6', name: 'Neural Interface Technology' },
        { id: '7', name: 'Manufacturing Innovation' },
        { id: '8', name: 'Global Operations Management' }
      ],
      experience: [
        {
          id: '1',
          jobTitle: 'CEO & Chief Engineer',
          company: 'SpaceX',
          location: 'Hawthorne, California',
          startDate: '2002-06-01',
          isCurrent: true,
          responsibilities: [
            'Founded and lead the world\'s most advanced space exploration company',
            'Developed reusable rocket technology reducing launch costs by 90%',
            'Successfully launched over 200 missions including crewed flights to ISS',
            'Pioneered Starship program for Mars colonization'
          ]
        },
        {
          id: '2',
          jobTitle: 'CEO & Product Architect',
          company: 'Tesla, Inc.',
          location: 'Austin, Texas',
          startDate: '2008-10-01',
          isCurrent: true,
          responsibilities: [
            'Transformed automotive industry with electric vehicle revolution',
            'Led development of Model S, Model 3, Model X, Model Y, and Cybertruck',
            'Built world\'s largest electric vehicle charging network',
            'Achieved over 2 million vehicles delivered globally'
          ]
        },
        {
          id: '3',
          jobTitle: 'CEO & Founder',
          company: 'Neuralink',
          location: 'Fremont, California',
          startDate: '2016-07-01',
          isCurrent: true,
          responsibilities: [
            'Developing brain-computer interface technology',
            'Creating implantable devices for medical applications',
            'Advancing human-AI symbiosis research',
            'Leading breakthrough innovations in neural engineering'
          ]
        }
      ],
      education: [
        {
          id: '1',
          degree: 'Bachelor of Science in Physics',
          institution: 'University of Pennsylvania',
          location: 'Philadelphia, Pennsylvania',
          graduationDate: '1997-05-01'
        },
        {
          id: '2',
          degree: 'Bachelor of Science in Economics',
          institution: 'University of Pennsylvania',
          location: 'Philadelphia, Pennsylvania',
          graduationDate: '1997-05-01'
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