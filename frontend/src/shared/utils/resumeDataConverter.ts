import { Resume } from '../services/api/types';
import { ResumeData } from '../types/resume';

/**
 * Converter for transforming UnifiedResume to new ResumeData structure
 * Simple copying as structures match
 */
export const convertApiResumeToResumeData = (apiResume: Resume): ResumeData => {
  return {
    personal_info: apiResume.personal_info,
    professional_summary: apiResume.professional_summary,
    skills: apiResume.skills,
    work_experience: apiResume.work_experience,
    education: apiResume.education,
    languages_spoken: apiResume.languages_spoken,
    awards: apiResume.awards,
  };
};
