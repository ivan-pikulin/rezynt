import { BaseApi } from './baseApi';
import {
  Resume,
  ResumeUpdate,
  PDFExportRequest,
  DOCXExportRequest,
  TaskStatus
} from './types';

export class ResumeApi extends BaseApi {
  /**
   * Get current user's resume (from User.resume_data)
   */
  async getResume(): Promise<Resume> {
    return this.get<Resume>('/resume/');
  }

  /**
   * Full update of current user's resume
   */
  async updateResume(data: ResumeUpdate): Promise<Resume> {
    return this.put<Resume>('/resume/', data);
  }

  /**
   * Delete current user's resume
   */
  async deleteResume(): Promise<{ status: string; message: string }> {
    return this.delete<{ status: string; message: string }>('/resume/');
  }

  /**
   * Upload a resume file for parsing
   */
  async uploadResume(file: File): Promise<{ task_id: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<{ task_id: string; message: string }>('/resume/upload', formData);
  }

  /**
   * Temp upload a resume file (for landing page, before auth)
   */
  async tempUploadResume(file: File): Promise<{ file_id: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<{ file_id: string; message: string }>('/resume/temp-upload', formData);
  }

  /**
   * Claim a temporary uploaded file and start processing
   */
  async claimTempFile(tempFileId: string): Promise<{ task_id: string; message: string }> {
    return this.post<{ task_id: string; message: string }>('/resume/claim-temp-file', { 
      temp_file_id: tempFileId 
    });
  }

  /**
   * Get upload task status
   */
  async getUploadStatus(taskId: string): Promise<TaskStatus> {
    return this.get<TaskStatus>(`/resume/upload/status/${taskId}`);
  }

  /**
   * Export resume to PDF
   * @param data PDF export request with HTML content and template slug
   */
  async exportResumePDF(data: PDFExportRequest): Promise<Blob> {
    return this.post<Blob>('/resume/export-pdf', data, {
      responseType: 'blob'
    });
  }

  /**
   * Export stored resume to DOCX
   * @param data DOCX export request with template slug
   */
  async exportResumeDOCX(data: DOCXExportRequest): Promise<Blob> {
    return this.post<Blob>('/resume/export-docx', data, {
      responseType: 'blob'
    });
  }
}

export const resumeApi = new ResumeApi();
