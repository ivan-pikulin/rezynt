import { resumeApi } from '../../shared/services/api';
import { Resume } from '../../shared/services/api/types';
import i18n from '../../shared/i18n';

export const startApi = {
  /**
 * Upload resume file
 */
  uploadResume: async (file: File): Promise<{ resume: Resume; startupMessage?: string }> => {
          // Upload file and get task_id
    const uploadResult = await resumeApi.uploadResume(file);
    
    // Wait for processing to complete
    let status = 'PENDING';
    let result = null;
    
    while (status === 'PENDING' || status === 'STARTED') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const statusResult = await resumeApi.getUploadStatus(uploadResult.task_id);
      status = statusResult.state;
      
      if (status === 'SUCCESS') {
        result = await resumeApi.getUploadResult(uploadResult.task_id);
        break;
      } else if (status === 'FAILURE') {
        throw new Error(statusResult.error || i18n.t('errors.uploadFailedGeneric'));
      }
    }
    
    if (!result || !result.resume_id) {
      throw new Error(i18n.t('errors.noResumeId'));
    }
    
    // Get created resume
    const resume = await resumeApi.getResume(result.resume_id);
    
    // Return resume and startup message
    return {
      resume,
      startupMessage: result.startup_message
    };
  },

  /**
   * Start creating resume from scratch
   */
  startFromScratch: async (): Promise<Resume> => {
    // Create resume with template_slug (use first available template)
    const resume = await resumeApi.createResume({
      title: i18n.t('defaults.resumeTitle'),
      template_slug: 'nume', // Default template
      professional_summary: ''
    });

    return resume;
  }
}; 