import { BaseApi } from './baseApi';
import { Template, TemplateCreate, TemplateUpdate } from './types';

export class TemplateApi extends BaseApi {
  /**
   * Get all templates
   */
  async getTemplates(): Promise<Template[]> {
    return this.get<Template[]>('/api/v1/templates/');
  }

  /**
   * Get premium templates only
   */
  async getPremiumTemplates(): Promise<Template[]> {
    return this.get<Template[]>('/api/v1/templates/premium');
  }

  /**
   * Get free templates only
   */
  async getFreeTemplates(): Promise<Template[]> {
    return this.get<Template[]>('/api/v1/templates/free');
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<Template> {
    return this.get<Template>(`/api/v1/templates/${templateId}`);
  }

  /**
   * Get a specific template by slug
   */
  async getTemplateBySlug(slug: string): Promise<Template> {
    return this.get<Template>(`/api/v1/templates/slug/${slug}`);
  }

  /**
   * Create a new template
   */
  async createTemplate(data: TemplateCreate): Promise<Template> {
    return this.post<Template>('/api/v1/templates/', data);
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId: string, data: TemplateUpdate): Promise<Template> {
    return this.put<Template>(`/api/v1/templates/${templateId}`, data);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    return this.delete<void>(`/api/v1/templates/${templateId}`);
  }
}

export const templateApi = new TemplateApi();
