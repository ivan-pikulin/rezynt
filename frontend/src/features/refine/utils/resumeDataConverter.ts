import { Resume } from '../../../shared/services/api/types';
import { ResumeData } from '../../../shared/types/resume';

/**
 * Преобразует данные резюме из API формата в формат для отображения
 */
export function convertApiResumeToDisplayData(apiResume: Resume): ResumeData {
  return {
    id: apiResume.id,
    user_id: apiResume.user_id,
    title: apiResume.title,
    template_id: apiResume.template_id,
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
 * Преобразует данные резюме из формата отображения в API формат
 */
export function convertDisplayDataToApiResume(displayData: ResumeData, resumeId: string): Partial<Resume> {
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
