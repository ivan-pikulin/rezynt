import baseApi from '../../shared/services/api/baseApi';
import { ExportResponse } from '../../shared/services/api/types';

export interface PDFExportRequest {
  html_content: string;
  filename?: string;
  template_id?: string;
}

export const exportApi = {
  downloadResume: async (planId: 'pro' | 'lifetime'): Promise<ExportResponse> => {
    // Здесь будет логика для загрузки резюме в зависимости от плана
    console.log(`Downloading resume with plan: ${planId}`);
    
    // Имитация API вызова
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, planId });
      }, 1000);
    });
  },

  exportToPDF: async (resumeId: string, request: PDFExportRequest): Promise<Blob> => {
    const response = await baseApi.post(
      `/resume/${resumeId}/export-pdf`,
      request,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  }
}; 