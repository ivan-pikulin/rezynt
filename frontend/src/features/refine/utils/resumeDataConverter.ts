import { Resume } from '../../../shared/services/api/types';
import { ResumeData } from '../../../shared/types/resume';

/**
 * Converts resume data from API format to display format
 */
export function convertApiResumeToDisplayData(apiResume: Resume): ResumeData {
  return {
    id: apiResume.id,
    user_id: apiResume.user_id,
    title: apiResume.title,
    template_slug: apiResume.template_slug,
    professional_summary: apiResume.professional_summary,
    conversation_id: apiResume.conversation_id,
    created_at: apiResume.created_at,
    updated_at: apiResume.updated_at,
    first_name: apiResume.first_name,
    last_name: apiResume.last_name,
    location: apiResume.location,
    contacts: apiResume.contacts,
    skills: apiResume.skills,
    experience: apiResume.experience,
    education: apiResume.education
  };
}

/**
 * Converts resume data from display format to API format
 */
export function convertDisplayDataToApiResume(displayData: ResumeData, resumeId: number): Partial<Resume> {
  return {
    id: resumeId,
    title: displayData.title || '',
    professional_summary: displayData.professional_summary,
    first_name: displayData.first_name,
    last_name: displayData.last_name,
    location: displayData.location,
    contacts: displayData.contacts,
    skills: displayData.skills,
    experience: displayData.experience,
    education: displayData.education
  };
}
