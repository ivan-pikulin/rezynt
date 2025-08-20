import { resumeApi, templateApi } from '../../shared/services/api';
import { Resume } from '../../shared/services/api/types';

export const startApi = {
  /**
   * Загрузить файл резюме
   */
  uploadResume: async (file: File): Promise<Resume> => {
    return resumeApi.uploadResume(file);
  },

  /**
   * Начать создание резюме с нуля
   */
  startFromScratch: async (): Promise<Resume> => {
    console.log('startFromScratch called');
    
    // Сначала получаем UUID шаблона по slug
    console.log('Fetching template...');
    const template = await templateApi.getTemplateBySlug('tero');
    console.log('Template ID:', template.id);
    
    // Создаем резюме с полученным UUID шаблона
    console.log('Creating resume...');
    const resume = await resumeApi.createResume({
      title: 'New Resume',
      template_id: template.id,
      professional_summary: ''
    });
    console.log('Resume created:', resume);
    return resume;
  }
}; 