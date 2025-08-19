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
    console.log('startFromScratch called');
    
    // Сначала получаем UUID шаблона по slug
    console.log('Fetching template...');
    const templateResponse = await baseApi.get('/template/slug/tero');
    const templateId = templateResponse.data.id;
    console.log('Template ID:', templateId);
    
    // Создаем резюме с полученным UUID шаблона
    console.log('Creating resume...');
    const response = await baseApi.post('/resume/', {
      title: 'New Resume',
      template_id: templateId,
      professional_summary: ''
    });
    console.log('Resume created:', response.data);
    return response.data;
  }
}; 