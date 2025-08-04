import baseApi from '../../shared/services/api/baseApi';
import { PricingPlan, DownloadResponse } from '../../shared/services/api/types';

export const exportApi = {
  /**
   * Получить тарифные планы
   */
  getPricing: async (): Promise<PricingPlan[]> => {
    // Моковая реализация
    console.log('Mock: Getting pricing plans');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // В реальной реализации:
    // const response = await baseApi.get('/export/pricing/');
    // return response.data;
    
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['PDF Export', 'Basic Templates', 'Watermarks'],
        isPopular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        features: ['PDF Export', 'Word Export', 'PNG Export', 'All Templates', 'No Watermarks', 'Priority Support'],
        isPopular: true
      }
    ];
  },

  /**
   * Скачать резюме
   */
  downloadResume: async (plan: 'free' | 'pro'): Promise<DownloadResponse> => {
    // Моковая реализация
    console.log(`Mock: Downloading resume with ${plan} plan`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Имитация загрузки
    
    // В реальной реализации:
    // const response = await baseApi.post('/export/download/', { plan });
    // return response.data;
    
    return {
      success: true,
      downloadUrl: `https://example.com/download/resume-${plan}.pdf`,
      message: `Resume downloaded successfully with ${plan} plan`
    };
  },

  /**
   * Экспорт в PDF
   */
  exportToPDF: async (): Promise<DownloadResponse> => {
    // Моковая реализация
    console.log('Mock: Exporting to PDF');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // В реальной реализации:
    // const response = await baseApi.post('/export/pdf/');
    // return response.data;
    
    return {
      success: true,
      downloadUrl: 'https://example.com/download/resume.pdf',
      message: 'PDF exported successfully'
    };
  },

  /**
   * Экспорт в Word
   */
  exportToWord: async (): Promise<DownloadResponse> => {
    // Моковая реализация
    console.log('Mock: Exporting to Word');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // В реальной реализации:
    // const response = await baseApi.post('/export/word/');
    // return response.data;
    
    return {
      success: true,
      downloadUrl: 'https://example.com/download/resume.docx',
      message: 'Word document exported successfully'
    };
  },

  /**
   * Экспорт в PNG
   */
  exportToPNG: async (): Promise<DownloadResponse> => {
    // Моковая реализация
    console.log('Mock: Exporting to PNG');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // В реальной реализации:
    // const response = await baseApi.post('/export/png/');
    // return response.data;
    
    return {
      success: true,
      downloadUrl: 'https://example.com/download/resume.png',
      message: 'PNG image exported successfully'
    };
  }
}; 