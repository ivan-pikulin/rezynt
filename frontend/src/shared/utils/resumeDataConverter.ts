import { Resume } from '../services/api/types';
import { ResumeData } from '../types/resume';

/**
 * Конвертер для преобразования UnifiedResume в новую структуру ResumeData
 * Простое копирование, так как структуры совпадают
 */
export const convertApiResumeToResumeData = (apiResume: Resume): ResumeData => {
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
};
