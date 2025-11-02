import { Resume } from '../../../shared/services/api/types';
import { ResumeData } from '../../../shared/types/resume';

/**
 * Converts resume data from API format to display format
 */
export function convertApiResumeToDisplayData(apiResume: Resume): ResumeData {
  return {
    personal_info: apiResume.personal_info,
    professional_summary: apiResume.professional_summary,
    skills: apiResume.skills,
    work_experience: apiResume.work_experience,
    education: apiResume.education,
    languages_spoken: apiResume.languages_spoken,
    awards: apiResume.awards
  };
}

/**
 * Converts resume data from display format to API format
 */
export function convertDisplayDataToApiResume(displayData: ResumeData): Partial<Resume> {
  return {
    personal_info: displayData.personal_info,
    professional_summary: displayData.professional_summary,
    skills: displayData.skills,
    work_experience: displayData.work_experience,
    education: displayData.education,
    languages_spoken: displayData.languages_spoken,
    awards: displayData.awards
  };
}
