import baseApi from '../../shared/services/api/baseApi';
import { UploadResponse } from '../../shared/services/api/types';

export const startApi = {
  /**
   * Загрузить файл резюме
   */
  uploadResume: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await baseApi.post('/resume/upload', formData);
    return response.data;
  },

  /**
   * Начать создание резюме с нуля
   */
  startFromScratch: async (): Promise<{ id: string }> => {
    // Сначала получаем UUID шаблона по slug
    const templateResponse = await baseApi.get('/template/slug/tero');
    const templateId = templateResponse.data.id;
    
    // Создаем резюме с полученным UUID шаблона
    const response = await baseApi.post('/resume/', {
      title: 'New Resume',
      template_id: templateId,
      professional_summary: ''
    });
    return response.data;
  }
}; 