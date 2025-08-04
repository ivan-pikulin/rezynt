import baseApi from '../../shared/services/api/baseApi';
import { UploadResponse } from '../../shared/services/api/types';

export const startApi = {
  /**
   * Загрузить файл резюме
   */
  uploadResume: async (file: File): Promise<UploadResponse> => {
    // Моковая реализация
    console.log('Mock: Uploading file:', file.name);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
    
    // В реальной реализации:
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await baseApi.post('/start/upload-resume/', formData);
    // return response.data;
    
    return {
      fileId: 'mock-file-id',
      fileName: file.name,
      success: true,
      message: 'File uploaded successfully'
    };
  },

  /**
   * Начать создание резюме с нуля
   */
  startFromScratch: async (): Promise<{ sessionId: string }> => {
    // Моковая реализация
    console.log('Mock: Starting from scratch');
    await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки
    
    // В реальной реализации:
    // const response = await baseApi.post('/start/from-scratch/');
    // return response.data;
    
    return { sessionId: 'mock-session-id' };
  }
}; 