import { resumeApi, templateApi } from '../../shared/services/api';
import { Resume } from '../../shared/services/api/types';

export const startApi = {
  /**
   * Загрузить файл резюме
   */
  uploadResume: async (file: File): Promise<Resume> => {
    // Загружаем файл и получаем task_id
    const uploadResult = await resumeApi.uploadResume(file);
    
    // Ждем завершения обработки
    let status = 'PENDING';
    let result = null;
    
    while (status === 'PENDING' || status === 'STARTED') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду
      const statusResult = await resumeApi.getUploadStatus(uploadResult.task_id);
      status = statusResult.state;
      
      if (status === 'SUCCESS') {
        result = await resumeApi.getUploadResult(uploadResult.task_id);
        break;
      } else if (status === 'FAILURE') {
        throw new Error(statusResult.error || 'Upload failed');
      }
    }
    
    if (!result || !result.resume_id) {
      throw new Error('Failed to get resume ID from upload result');
    }
    
    // Получаем созданное резюме
    return await resumeApi.getResume(result.resume_id);
  },

  /**
   * Начать создание резюме с нуля
   */
  startFromScratch: async (): Promise<Resume> => {
    console.log('startFromScratch called');
    
    // Сначала получаем ID шаблона по slug
    console.log('Fetching template...');
    const template = await templateApi.getTemplateBySlug('tero');
    console.log('Template ID:', template.id);
    
    // Создаем резюме с полученным ID шаблона
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