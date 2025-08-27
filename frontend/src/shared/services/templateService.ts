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
    console.log('🎨 [TemplateService] getTemplates called:', {
      totalTemplates: TEMPLATE_CONFIGS.length,
      templates: TEMPLATE_CONFIGS.map(t => ({ id: t.id, name: t.name }))
    });
    return TEMPLATE_CONFIGS;
  }

  /**
   * Получить шаблон по ID
   */
  static getTemplateById(id: string): TemplateConfig | undefined {
    console.log('🎨 [TemplateService] getTemplateById called:', {
      requestedId: id,
      availableIds: TEMPLATE_CONFIGS.map(t => t.id)
    });
    
    const template = TEMPLATE_CONFIGS.find(template => template.id === id);
    
    console.log('🎨 [TemplateService] getTemplateById result:', {
      requestedId: id,
      found: !!template,
      templateName: template?.name,
      templateCategory: template?.category
    });
    
    return template;
  }

  /**
   * Получить шаблоны по категории
   */
  static getTemplatesByCategory(category: string): TemplateConfig[] {
    console.log('🎨 [TemplateService] getTemplatesByCategory called:', {
      category,
      availableCategories: [...new Set(TEMPLATE_CONFIGS.map(t => t.category))]
    });
    
    const templates = TEMPLATE_CONFIGS.filter(template => template.category === category);
    
    console.log('🎨 [TemplateService] getTemplatesByCategory result:', {
      category,
      found: templates.length,
      templates: templates.map(t => ({ id: t.id, name: t.name }))
    });
    
    return templates;
  }

  /**
   * Создать демо данные для тестирования шаблонов
   */
  static createDemoData(): ResumeData {
    return {
      title: 'Elon Musk Resume',
      professional_summary: 'Visionary entrepreneur and engineer with over 25 years of experience revolutionizing multiple industries. Proven track record of building world-changing companies including Tesla, SpaceX, Neuralink, and The Boring Company. Expert in sustainable technology, rocket engineering, and disruptive innovation.',
      
      // Персональная информация
      first_name: 'Elon',
      last_name: 'Musk',
      location: 'Austin, Texas, USA',
      
      // Контакты
      contacts: [
        '+1 (310) 363-6000',
        'elon.musk@tesla.com'
      ],
      
      // Навыки
      skills: [
        'Strategic Leadership',
        'Electric Vehicle Engineering',
        'Rocket Propulsion Systems',
        'Artificial Intelligence',
        'Sustainable Energy',
        'Neural Interface Technology',
        'Manufacturing Innovation',
        'Global Operations Management'
      ],
      
      // Опыт работы
      experience: [
        {
          job_title: 'CEO & Chief Engineer',
          company: 'SpaceX',
          location: 'Hawthorne, California',
          start_date: '2002-06-01',
          responsibilities: [
            'Founded and lead the world\'s most advanced space exploration company',
            'Developed reusable rocket technology reducing launch costs by 90%',
            'Successfully launched over 200 missions including crewed flights to ISS',
            'Pioneered Starship program for Mars colonization'
          ]
        },
        {
          job_title: 'CEO & Product Architect',
          company: 'Tesla, Inc.',
          location: 'Austin, Texas',
          start_date: '2008-10-01',
          responsibilities: [
            'Transformed automotive industry with electric vehicle revolution',
            'Led development of Model S, Model 3, Model X, Model Y, and Cybertruck',
            'Built world\'s largest electric vehicle charging network',
            'Achieved over 2 million vehicles delivered globally'
          ]
        },
        {
          job_title: 'CEO & Founder',
          company: 'Neuralink',
          location: 'Fremont, California',
          start_date: '2016-07-01',
          responsibilities: [
            'Developing brain-computer interface technology',
            'Creating implantable devices for medical applications',
            'Advancing human-AI symbiosis research',
            'Leading breakthrough innovations in neural engineering'
          ]
        }
      ],
      
      // Образование
      education: [
        {
          degree: 'Bachelor of Science in Physics',
          institution: 'University of Pennsylvania',
          location: 'Philadelphia, Pennsylvania',
          graduation_date: '1997-05-01'
        },
        {
          degree: 'Bachelor of Science in Economics',
          institution: 'University of Pennsylvania',
          location: 'Philadelphia, Pennsylvania',
          graduation_date: '1997-05-01'
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
    if (!data.first_name) errors.push('First name is required');
    if (!data.last_name) errors.push('Last name is required');
    if (!data.location) errors.push('Location is required');

    // Проверка контактов
    if (!data.contacts || data.contacts.length === 0) {
      errors.push('At least one contact is required');
    }

    // Проверка профессионального резюме
    if (!data.professional_summary) errors.push('Professional summary is required');

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