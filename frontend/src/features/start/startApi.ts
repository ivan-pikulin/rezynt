import { resumeApi } from '../../shared/services/api';
import { Resume } from '../../shared/services/api/types';
import i18n from '../../shared/i18n';

export const startApi = {
  /**
 * Upload resume file
 */
  uploadResume: async (file: File): Promise<Resume> => {
          // Upload file and get task_id
    const uploadResult = await resumeApi.uploadResume(file);

    // Wait for processing to complete
    let status = 'PENDING';
    let result = null;

    // Poll while task is in progress (PENDING, STARTED, PARSING states)
    while (status === 'PENDING' || status === 'STARTED' || status === 'PARSING') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const statusResult = await resumeApi.getUploadStatus(uploadResult.task_id);
      status = statusResult.state;
      result = statusResult;

      if (status === 'SUCCESS' || status === 'ANALYZING') {
        break;
      } else if (status === 'FAILURE') {
        throw new Error(statusResult.error || i18n.t('errors.uploadFailedGeneric'));
      }
    }

    if (!result || (result.state !== 'SUCCESS' && result.state !== 'ANALYZING')) {
      throw new Error(i18n.t('errors.uploadFailedGeneric'));
    }

    // Get user's resume (each user has one resume)
    const resume = await resumeApi.getResume();

    return resume;
  }
}; 