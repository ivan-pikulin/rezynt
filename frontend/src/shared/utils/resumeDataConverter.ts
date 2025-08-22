import { Resume } from '../services/api/types';
import { ResumeData, PersonalInfo, Experience, Education, Skill } from '../types/resume';

export const convertApiResumeToResumeData = (apiResume: Resume): ResumeData => {
  // Convert personal info
  const personalInfo: PersonalInfo = {
    firstName: apiResume.personal_info?.first_name || '',
    lastName: apiResume.personal_info?.last_name || '',
    middleName: apiResume.personal_info?.middle_name || '',
    phone: apiResume.personal_info?.phone || '',
    email: apiResume.personal_info?.email || '',
    location: apiResume.personal_info?.location || ''
  };

  // Convert skills
  const skills: Skill[] = (apiResume.skills || []).map(skill => ({
    id: skill.id,
    name: skill.name,
    category: skill.category
  }));

  // Convert experience
  const experience: Experience[] = (apiResume.experience || []).map(exp => ({
    id: exp.id,
    jobTitle: exp.job_title,
    company: exp.company,
    location: exp.location,
    startDate: exp.start_date,
    endDate: exp.end_date,
    isCurrent: exp.is_current,
    responsibilities: exp.responsibilities || []
  }));

  // Convert education
  const education: Education[] = (apiResume.education || []).map(edu => ({
    id: edu.id,
    degree: edu.degree,
    institution: edu.institution,
    location: edu.location,
    graduationDate: edu.graduation_date,
    fieldOfStudy: edu.field_of_study
  }));

  return {
    personalInfo,
    professionalSummary: apiResume.professional_summary || '',
    skills,
    experience,
    education
  };
};
