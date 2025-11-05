import { BaseApi } from './baseApi';
import { AnalysisResult } from './types';

export class AnalysisApi extends BaseApi {
  /**
   * Get analysis for current user's resume
   */
  async getAnalysis(): Promise<AnalysisResult> {
    return this.get<AnalysisResult>('/analysis/');
  }

  /**
   * Force refresh of analysis (bypass cache)
   */
  async refreshAnalysis(): Promise<AnalysisResult> {
    return this.post<AnalysisResult>('/analysis/refresh');
  }
}

export const analysisApi = new AnalysisApi();

