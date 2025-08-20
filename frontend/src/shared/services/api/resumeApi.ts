import { BaseApi } from './baseApi';
import {
  Resume,
  ResumeList,
  ResumeCreate,
  ResumeUpdate,
  ResumePartialUpdate,
  ResumePersonalInfoUpdate,
  ResumeSkillCreate,
  ResumeExperienceCreate,
  ResumeEducationCreate,
  ResumeProjectCreate,
  ResumeCertificationCreate,
  ResumeLanguageCreate,
  ResumeReferenceCreate,
  ResumeVolunteerCreate,
  ResumeAwardCreate,
  ResumePublicationCreate,
  ResumePatentCreate,
  ResumeCourseCreate,
  ResumeTestScoreCreate,
  ResumeHobbyCreate,
  ResumeCustomSectionCreate,
  ResumeExportCreate
} from './types';

export class ResumeApi extends BaseApi {
  /**
   * Get all resumes for current user
   */
  async getUserResumes(): Promise<ResumeList[]> {
    return this.get<ResumeList[]>('/api/v1/resumes/');
  }

  /**
   * Create a new resume
   */
  async createResume(data: ResumeCreate): Promise<Resume> {
    return this.post<Resume>('/api/v1/resumes/', data);
  }

  /**
   * Get a specific resume by ID
   */
  async getResume(resumeId: string): Promise<Resume> {
    return this.get<Resume>(`/api/v1/resumes/${resumeId}`);
  }

  /**
   * Update a resume partially
   */
  async updateResumePartial(resumeId: string, data: ResumePartialUpdate): Promise<Resume> {
    return this.patch<Resume>(`/api/v1/resumes/${resumeId}`, data);
  }

  /**
   * Update a resume completely
   */
  async updateResume(resumeId: string, data: ResumeUpdate): Promise<Resume> {
    return this.put<Resume>(`/api/v1/resumes/${resumeId}`, data);
  }

  /**
   * Delete a resume
   */
  async deleteResume(resumeId: string): Promise<void> {
    return this.delete<void>(`/api/v1/resumes/${resumeId}`);
  }

  // Personal Info
  async updatePersonalInfo(resumeId: string, data: ResumePersonalInfoUpdate): Promise<any> {
    return this.patch<any>(`/api/v1/resumes/${resumeId}/personal-info`, data);
  }

  // Skills
  async addSkill(resumeId: string, data: ResumeSkillCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/skills`, data);
  }

  async removeSkill(resumeId: string, skillId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/skills/${skillId}`);
  }

  async updateSkillOrder(resumeId: string, skillIds: string[]): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/skills/order`, skillIds);
  }

  // Experience
  async addExperience(resumeId: string, data: ResumeExperienceCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/experience`, data);
  }

  async updateExperience(resumeId: string, experienceId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/experience/${experienceId}`, data);
  }

  async removeExperience(resumeId: string, experienceId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/experience/${experienceId}`);
  }

  async updateExperienceOrder(resumeId: string, experienceIds: string[]): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/experience/order`, experienceIds);
  }

  // Education
  async addEducation(resumeId: string, data: ResumeEducationCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/education`, data);
  }

  async updateEducation(resumeId: string, educationId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/education/${educationId}`, data);
  }

  async removeEducation(resumeId: string, educationId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/education/${educationId}`);
  }

  async updateEducationOrder(resumeId: string, educationIds: string[]): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/education/order`, educationIds);
  }

  // Projects
  async addProject(resumeId: string, data: ResumeProjectCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/projects`, data);
  }

  async updateProject(resumeId: string, projectId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/projects/${projectId}`, data);
  }

  async removeProject(resumeId: string, projectId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/projects/${projectId}`);
  }

  // Certifications
  async addCertification(resumeId: string, data: ResumeCertificationCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/certifications`, data);
  }

  async updateCertification(resumeId: string, certificationId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/certifications/${certificationId}`, data);
  }

  async removeCertification(resumeId: string, certificationId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/certifications/${certificationId}`);
  }

  // Languages
  async addLanguage(resumeId: string, data: ResumeLanguageCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/languages`, data);
  }

  async updateLanguage(resumeId: string, languageId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/languages/${languageId}`, data);
  }

  async removeLanguage(resumeId: string, languageId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/languages/${languageId}`);
  }

  // References
  async addReference(resumeId: string, data: ResumeReferenceCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/references`, data);
  }

  async updateReference(resumeId: string, referenceId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/references/${referenceId}`, data);
  }

  async removeReference(resumeId: string, referenceId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/references/${referenceId}`);
  }

  // Volunteer
  async addVolunteer(resumeId: string, data: ResumeVolunteerCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/volunteer`, data);
  }

  async updateVolunteer(resumeId: string, volunteerId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/volunteer/${volunteerId}`, data);
  }

  async removeVolunteer(resumeId: string, volunteerId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/volunteer/${volunteerId}`);
  }

  // Awards
  async addAward(resumeId: string, data: ResumeAwardCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/awards`, data);
  }

  async updateAward(resumeId: string, awardId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/awards/${awardId}`, data);
  }

  async removeAward(resumeId: string, awardId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/awards/${awardId}`);
  }

  // Publications
  async addPublication(resumeId: string, data: ResumePublicationCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/publications`, data);
  }

  async updatePublication(resumeId: string, publicationId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/publications/${publicationId}`, data);
  }

  async removePublication(resumeId: string, publicationId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/publications/${publicationId}`);
  }

  // Patents
  async addPatent(resumeId: string, data: ResumePatentCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/patents`, data);
  }

  async updatePatent(resumeId: string, patentId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/patents/${patentId}`, data);
  }

  async removePatent(resumeId: string, patentId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/patents/${patentId}`);
  }

  // Courses
  async addCourse(resumeId: string, data: ResumeCourseCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/courses`, data);
  }

  async updateCourse(resumeId: string, courseId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/courses/${courseId}`, data);
  }

  async removeCourse(resumeId: string, courseId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/courses/${courseId}`);
  }

  // Test Scores
  async addTestScore(resumeId: string, data: ResumeTestScoreCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/test-scores`, data);
  }

  async updateTestScore(resumeId: string, testScoreId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/test-scores/${testScoreId}`, data);
  }

  async removeTestScore(resumeId: string, testScoreId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/test-scores/${testScoreId}`);
  }

  // Hobbies
  async addHobby(resumeId: string, data: ResumeHobbyCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/hobbies`, data);
  }

  async updateHobby(resumeId: string, hobbyId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/hobbies/${hobbyId}`, data);
  }

  async removeHobby(resumeId: string, hobbyId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/hobbies/${hobbyId}`);
  }

  // Custom Sections
  async addCustomSection(resumeId: string, data: ResumeCustomSectionCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/custom-sections`, data);
  }

  async updateCustomSection(resumeId: string, sectionId: string, data: any): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/custom-sections/${sectionId}`, data);
  }

  async removeCustomSection(resumeId: string, sectionId: string): Promise<any> {
    return this.delete<any>(`/api/v1/resumes/${resumeId}/custom-sections/${sectionId}`);
  }

  // Export
  async addExportRecord(resumeId: string, data: ResumeExportCreate): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/exports`, data);
  }

  async getExportHistory(resumeId: string): Promise<any> {
    return this.get<any>(`/api/v1/resumes/${resumeId}/exports`);
  }

  // Template assignment
  async assignTemplate(resumeId: string, templateId: string): Promise<any> {
    return this.put<any>(`/api/v1/resumes/${resumeId}/template/${templateId}`, {});
  }

  // Upload resume file
  async uploadResume(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.post<any>('/api/v1/resumes/upload', formData);
  }

  // AI update
  async updateWithAI(resumeId: string, aiUpdate: any): Promise<any> {
    return this.post<any>(`/api/v1/resumes/${resumeId}/ai-update`, aiUpdate, {
      headers: {
        'X-API-Key': import.meta.env.VITE_APP_API_KEY
      }
    });
  }
}

export const resumeApi = new ResumeApi();
