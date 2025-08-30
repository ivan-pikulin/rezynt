import { resumeApi } from '../../shared/services/api';
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
    // Создаем резюме с template_slug (используем первый доступный темплейт)
    const resume = await resumeApi.createResume({
      title: 'My Resume',
      template_slug: 'nume', // Default template
      professional_summary: ''
    });

    return resume;
  }
}; 