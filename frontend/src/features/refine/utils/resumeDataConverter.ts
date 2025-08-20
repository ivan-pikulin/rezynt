import { Resume } from '../../../shared/services/api/types';
import { ResumeData } from '../../../shared/types/resume';

/**
 * Преобразует данные резюме из API формата в формат для отображения
 */
export function convertApiResumeToDisplayData(apiResume: Resume): ResumeData {
  return {
    personalInfo: {
      firstName: apiResume.personal_info?.first_name || '',
      lastName: apiResume.personal_info?.last_name || '',
      middleName: apiResume.personal_info?.middle_name || '',
      phone: apiResume.personal_info?.phone || '',
      email: apiResume.personal_info?.email || '',
      location: apiResume.personal_info?.location || '',
    },
    professionalSummary: apiResume.professional_summary || '',
    skills: apiResume.skills?.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: undefined // API не содержит категории
    })) || [],
    experience: apiResume.experience?.map(exp => ({
      id: exp.id,
      jobTitle: exp.job_title,
      company: exp.company,
      location: exp.location || '',
      startDate: exp.start_date,
      endDate: exp.end_date || '',
      isCurrent: exp.is_current,
      responsibilities: exp.responsibilities
    })) || [],
    education: apiResume.education?.map(edu => ({
      id: edu.id,
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location || '',
      graduationDate: edu.graduation_date || '',
      fieldOfStudy: undefined // API не содержит fieldOfStudy
    })) || []
  };
}

/**
 * Преобразует данные резюме из формата отображения в API формат
 */
export function convertDisplayDataToApiResume(displayData: ResumeData, resumeId: string): Partial<Resume> {
  return {
    id: resumeId,
    title: '', // Заполняется отдельно
    professional_summary: displayData.professionalSummary,
    personal_info: {
      id: '', // Заполняется сервером
      resume_id: resumeId,
      first_name: displayData.personalInfo.firstName,
      last_name: displayData.personalInfo.lastName,
      middle_name: displayData.personalInfo.middleName,
      phone: displayData.personalInfo.phone,
      email: displayData.personalInfo.email,
      location: displayData.personalInfo.location,
      website: '',
      linkedin: '',
      github: '',
      order: 0
    },
    skills: displayData.skills.map(skill => ({
      id: skill.id,
      resume_id: resumeId,
      name: skill.name,
      order: 0
    })),
    experience: displayData.experience.map(exp => ({
      id: exp.id,
      resume_id: resumeId,
      job_title: exp.jobTitle,
      company: exp.company,
      location: exp.location,
      start_date: exp.startDate,
      end_date: exp.endDate,
      is_current: exp.isCurrent,
      responsibilities: exp.responsibilities,
      order: 0
    })),
    education: displayData.education.map(edu => ({
      id: edu.id,
      resume_id: resumeId,
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location,
      graduation_date: edu.graduationDate,
      gpa: undefined,
      order: 0
    }))
  };
}
