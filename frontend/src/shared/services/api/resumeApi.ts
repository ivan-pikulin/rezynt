import { BaseApi } from './baseApi';
import {
  Resume,
  UnifiedResume,
  ResumeList,
  ResumeCreate,
  ResumeUpdate,
  ResumePartialUpdate,
  ResumeContactCreate,
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
    return this.get<ResumeList[]>('/resume/');
  }

  /**
   * Create a new resume
   */
  async createResume(data: ResumeCreate): Promise<Resume> {
    return this.post<Resume>('/resume/', data);
  }

  /**
   * Upload a resume file
   */
  async uploadResume(file: File): Promise<{ task_id: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<{ task_id: string; message: string }>('/resume/upload', formData);
  }

  /**
   * Get upload status
   */
  async getUploadStatus(taskId: string): Promise<any> {
    return this.get<any>(`/resume/upload/status/${taskId}`);
  }

  /**
   * Get upload result
   */
  async getUploadResult(taskId: string): Promise<any> {
    return this.get<any>(`/resume/upload/result/${taskId}`);
  }

  /**
   * Get a specific resume by ID (returns UnifiedResume structure)
   */
  async getResume(resumeId: number): Promise<Resume> {
    return this.get<Resume>(`/resume/${resumeId}`);
  }

  /**
   * Update a resume partially
   */
  async updateResumePartial(resumeId: number, data: ResumePartialUpdate): Promise<Resume> {
    return this.patch<Resume>(`/resume/${resumeId}`, data);
  }

  /**
   * Update a resume completely
   */
  async updateResume(resumeId: number, data: ResumeUpdate): Promise<Resume> {
    return this.put<Resume>(`/resume/${resumeId}`, data);
  }

  /**
   * Assign a template to a resume by slug
   */
  async assignTemplateBySlug(resumeId: number, templateSlug: string): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/template/slug/${templateSlug}`);
  }

  /**
   * Delete a resume
   */
  async deleteResume(resumeId: number): Promise<void> {
    return this.delete<void>(`/resume/${resumeId}`);
  }

  // Personal Info - updated for UnifiedResume structure
  async updatePersonalInfo(resumeId: number, data: { first_name?: string; last_name?: string; location?: string }): Promise<any> {
    return this.patch<any>(`/resume/${resumeId}`, data);
  }

  // Contacts - updated for UnifiedResume structure
  async updateContacts(resumeId: number, contacts: string[]): Promise<any> {
    return this.patch<any>(`/resume/${resumeId}`, { contacts });
  }

  // Skills - updated for UnifiedResume structure
  async updateSkills(resumeId: number, skills: string[]): Promise<any> {
    return this.patch<any>(`/resume/${resumeId}`, { skills });
  }

  // Experience - updated for UnifiedResume structure
  async updateExperience(resumeId: number, experience: any[]): Promise<any> {
    return this.patch<any>(`/resume/${resumeId}`, { experience });
  }

  // Education - updated for UnifiedResume structure
  async updateEducation(resumeId: number, education: any[]): Promise<any> {
    return this.patch<any>(`/resume/${resumeId}`, { education });
  }

  // Legacy methods for backward compatibility (simplified)
  async addContact(resumeId: number, data: ResumeContactCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/contacts`, data);
  }

  async removeContact(resumeId: number, contactId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/contacts/${contactId}`);
  }

  async addSkill(resumeId: number, data: ResumeSkillCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/skills`, data);
  }

  async removeSkill(resumeId: number, skillId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/skills/${skillId}`);
  }

  async addExperience(resumeId: number, data: ResumeExperienceCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/experience`, data);
  }

  async updateExperienceItem(resumeId: number, experienceId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/experience/${experienceId}`, data);
  }

  async removeExperience(resumeId: number, experienceId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/experience/${experienceId}`);
  }

  async addEducation(resumeId: number, data: ResumeEducationCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/education`, data);
  }

  async updateEducationItem(resumeId: number, educationId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/education/${educationId}`, data);
  }

  async removeEducation(resumeId: number, educationId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/education/${educationId}`);
  }

  // Projects
  async addProject(resumeId: number, data: ResumeProjectCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/projects`, data);
  }

  async updateProject(resumeId: number, projectId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/projects/${projectId}`, data);
  }

  async removeProject(resumeId: number, projectId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/projects/${projectId}`);
  }

  // Certifications
  async addCertification(resumeId: number, data: ResumeCertificationCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/certifications`, data);
  }

  async updateCertification(resumeId: number, certificationId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/certifications/${certificationId}`, data);
  }

  async removeCertification(resumeId: number, certificationId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/certifications/${certificationId}`);
  }

  // Languages
  async addLanguage(resumeId: number, data: ResumeLanguageCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/languages`, data);
  }

  async updateLanguage(resumeId: number, languageId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/languages/${languageId}`, data);
  }

  async removeLanguage(resumeId: number, languageId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/languages/${languageId}`);
  }

  // References
  async addReference(resumeId: number, data: ResumeReferenceCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/references`, data);
  }

  async updateReference(resumeId: number, referenceId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/references/${referenceId}`, data);
  }

  async removeReference(resumeId: number, referenceId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/references/${referenceId}`);
  }

  // Volunteer
  async addVolunteer(resumeId: number, data: ResumeVolunteerCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/volunteer`, data);
  }

  async updateVolunteer(resumeId: number, volunteerId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/volunteer/${volunteerId}`, data);
  }

  async removeVolunteer(resumeId: number, volunteerId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/volunteer/${volunteerId}`);
  }

  // Awards
  async addAward(resumeId: number, data: ResumeAwardCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/awards`, data);
  }

  async updateAward(resumeId: number, awardId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/awards/${awardId}`, data);
  }

  async removeAward(resumeId: number, awardId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/awards/${awardId}`);
  }

  // Publications
  async addPublication(resumeId: number, data: ResumePublicationCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/publications`, data);
  }

  async updatePublication(resumeId: number, publicationId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/publications/${publicationId}`, data);
  }

  async removePublication(resumeId: number, publicationId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/publications/${publicationId}`);
  }

  // Patents
  async addPatent(resumeId: number, data: ResumePatentCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/patents`, data);
  }

  async updatePatent(resumeId: number, patentId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/patents/${patentId}`, data);
  }

  async removePatent(resumeId: number, patentId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/patents/${patentId}`);
  }

  // Courses
  async addCourse(resumeId: number, data: ResumeCourseCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/courses`, data);
  }

  async updateCourse(resumeId: number, courseId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/courses/${courseId}`, data);
  }

  async removeCourse(resumeId: number, courseId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/courses/${courseId}`);
  }

  // Test Scores
  async addTestScore(resumeId: number, data: ResumeTestScoreCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/test-scores`, data);
  }

  async updateTestScore(resumeId: number, testScoreId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/test-scores/${testScoreId}`, data);
  }

  async removeTestScore(resumeId: number, testScoreId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/test-scores/${testScoreId}`);
  }

  // Hobbies
  async addHobby(resumeId: number, data: ResumeHobbyCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/hobbies`, data);
  }

  async updateHobby(resumeId: number, hobbyId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/hobbies/${hobbyId}`, data);
  }

  async removeHobby(resumeId: number, hobbyId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/hobbies/${hobbyId}`);
  }

  // Custom Sections
  async addCustomSection(resumeId: number, data: ResumeCustomSectionCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/custom-sections`, data);
  }

  async updateCustomSection(resumeId: number, customSectionId: number, data: any): Promise<any> {
    return this.put<any>(`/resume/${resumeId}/custom-sections/${customSectionId}`, data);
  }

  async removeCustomSection(resumeId: number, customSectionId: number): Promise<any> {
    return this.delete<any>(`/resume/${resumeId}/custom-sections/${customSectionId}`);
  }

  // Export
  async exportResume(resumeId: number, data: ResumeExportCreate): Promise<any> {
    return this.post<any>(`/resume/${resumeId}/export`, data);
  }

  async getExportStatus(resumeId: number, exportId: number): Promise<any> {
    return this.get<any>(`/resume/${resumeId}/export/${exportId}`);
  }

  async downloadExport(resumeId: number, exportId: number): Promise<any> {
    return this.get<any>(`/resume/${resumeId}/export/${exportId}/download`);
  }
}

export const resumeApi = new ResumeApi();
