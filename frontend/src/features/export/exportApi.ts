import baseApi from '../../shared/services/api/baseApi';
import { ExportResponse } from '../../shared/services/api/types';

export interface PDFExportRequest {
  html_content: string;
  filename?: string;
  template_slug: string; // Required: nume, luma, alto, vero
}

export const exportApi = {
  downloadResume: async (planId: 'pro' | 'lifetime'): Promise<ExportResponse> => {
    // Here will be logic for downloading resume based on plan
    console.log(`Downloading resume with plan: ${planId}`);
    
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, planId });
      }, 1000);
    });
  },

  exportToPDF: async (request: PDFExportRequest): Promise<Blob> => {
    const response = await baseApi.post(
      `/resume/export-pdf`,
      request,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  },

  exportToTXT: async (): Promise<Blob> => {
    const response = await baseApi.get(
      `/resume/export-txt`,
      {
        responseType: 'blob',
      }
    );
    
    return response.data;
  }
}; 