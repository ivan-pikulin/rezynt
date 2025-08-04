import baseApi from '../../shared/services/api/baseApi';
import { Suggestion } from '../../shared/services/api/types';

export const refineApi = {
  /**
   * Получить автопредложения для улучшения резюме
   */
  getSuggestions: async (context: string): Promise<Suggestion[]> => {
    const response = await baseApi.post('/refine/suggestions/', { context });
    return response.data;
  },

  /**
   * Обновить данные резюме
   */
  updateResume: async (data: any): Promise<{ success: boolean }> => {
    const response = await baseApi.put('/refine/update-resume/', data);
    return response.data;
  },

  /**
   * Применить шаблон к резюме
   */
  applyTemplate: async (templateId: string): Promise<{ success: boolean }> => {
    const response = await baseApi.post('/refine/apply-template/', { templateId });
    return response.data;
  }
}; 