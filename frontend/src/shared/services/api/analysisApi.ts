import { BaseApi } from './baseApi';
import { AnalysisResult, ApplyFixRequest, ApplyFixResponse } from './types';

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

  /**
   * Apply LLM fix for a specific improvement point
   */
  async applyFix(pointId: string, fieldPath: string): Promise<ApplyFixResponse> {
    const request: ApplyFixRequest = {
      point_id: pointId,
      field_path: fieldPath,
    };
    return this.post<ApplyFixResponse>('/analysis/fix', request);
  }
}

export const analysisApi = new AnalysisApi();

