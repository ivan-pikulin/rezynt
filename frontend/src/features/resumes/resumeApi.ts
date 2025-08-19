import baseApi from '../../shared/services/api/baseApi';

export interface ResumeApiResponse {
  id: string;
  title: string;
  template_id: string;
  user_id: string;
  professional_summary?: string;
  conversation_id?: string;
  created_at: string;
  updated_at: string;
  template?: {
    id: string;
    name: string;
    slug: string;
    is_premium: boolean;
  };
  personal_info?: {
    id: string;
    resume_id: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    location?: string;
  };
  skills: Array<{
    id: string;
    resume_id: string;
    name: string;
    order_index: number;
  }>;
  experience: Array<{
    id: string;
    resume_id: string;
    job_title: string;
    company: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    responsibilities?: string[];
    order_index: number;
  }>;
  education: Array<{
    id: string;
    resume_id: string;
    degree: string;
    institution: string;
    location?: string;
    graduation_date?: string;
    field_of_study?: string;
    order_index: number;
  }>;
}

export const resumeApi = {
  /**
   * Get all resumes for the current user with full data
   */
  async getAllResumes(): Promise<ResumeApiResponse[]> {
    const response = await baseApi.get('/resume/');
    return response.data;
  },

  /**
   * Get a specific resume by ID with full data
   */
  async getResume(resumeId: string): Promise<ResumeApiResponse> {
    const response = await baseApi.get(`/resume/${resumeId}`);
    return response.data;
  },

  /**
   * Create a new resume
   */
  async createResume(data: {
    title: string;
    template_id: string;
    professional_summary?: string;
  }): Promise<ResumeApiResponse> {
    const response = await baseApi.post('/resume/', data);
    return response.data;
  },

  /**
   * Update a resume
   */
  async updateResume(resumeId: string, data: {
    title?: string;
    template_id?: string;
    professional_summary?: string;
    conversation_id?: string;
  }): Promise<ResumeApiResponse> {
    const response = await baseApi.put(`/resume/${resumeId}`, data);
    return response.data;
  },

  /**
   * Partially update a resume
   */
  async partialUpdateResume(resumeId: string, data: any): Promise<ResumeApiResponse> {
    const response = await baseApi.patch(`/resume/${resumeId}`, data);
    return response.data;
  },

  /**
   * Delete a resume
   */
  async deleteResume(resumeId: string): Promise<void> {
    await baseApi.delete(`/resume/${resumeId}`);
  },

  /**
   * Update personal info
   */
  async updatePersonalInfo(resumeId: string, data: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    location?: string;
  }): Promise<any> {
    const response = await baseApi.patch(`/resume/${resumeId}/personal-info`, data);
    return response.data;
  },

  /**
   * Add a skill
   */
  async addSkill(resumeId: string, skillName: string): Promise<any> {
    const response = await baseApi.post(`/resume/${resumeId}/skills`, {
      name: skillName
    });
    return response.data;
  },

  /**
   * Remove a skill
   */
  async removeSkill(resumeId: string, skillId: string): Promise<any> {
    const response = await baseApi.delete(`/resume/${resumeId}/skills/${skillId}`);
    return response.data;
  },

  /**
   * Add experience
   */
  async addExperience(resumeId: string, data: {
    job_title: string;
    company: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    responsibilities?: string[];
  }): Promise<any> {
    const response = await baseApi.post(`/resume/${resumeId}/experience`, data);
    return response.data;
  },

  /**
   * Update experience
   */
  async updateExperience(resumeId: string, experienceId: string, data: any): Promise<any> {
    const response = await baseApi.put(`/resume/${resumeId}/experience/${experienceId}`, data);
    return response.data;
  },

  /**
   * Remove experience
   */
  async removeExperience(resumeId: string, experienceId: string): Promise<any> {
    const response = await baseApi.delete(`/resume/${resumeId}/experience/${experienceId}`);
    return response.data;
  },

  /**
   * Add education
   */
  async addEducation(resumeId: string, data: {
    degree: string;
    institution: string;
    location?: string;
    graduation_date?: string;
    field_of_study?: string;
  }): Promise<any> {
    const response = await baseApi.post(`/resume/${resumeId}/education`, data);
    return response.data;
  },

  /**
   * Update education
   */
  async updateEducation(resumeId: string, educationId: string, data: any): Promise<any> {
    const response = await baseApi.put(`/resume/${resumeId}/education/${educationId}`, data);
    return response.data;
  },

  /**
   * Remove education
   */
  async removeEducation(resumeId: string, educationId: string): Promise<any> {
    const response = await baseApi.delete(`/resume/${resumeId}/education/${educationId}`);
    return response.data;
  }
};
