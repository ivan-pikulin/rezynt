import { BaseApi } from './baseApi';
import { Template, TemplateCreate, TemplateUpdate } from './types';

export class TemplateApi extends BaseApi {
  /**
   * Get all templates
   */
  async getTemplates(): Promise<Template[]> {
    return this.get<Template[]>('/templates/');
  }

  /**
   * Get premium templates only
   */
  async getPremiumTemplates(): Promise<Template[]> {
    return this.get<Template[]>('/templates/premium');
  }

  /**
   * Get free templates only
   */
  async getFreeTemplates(): Promise<Template[]> {
    return this.get<Template[]>('/templates/free');
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: number): Promise<Template> {
    return this.get<Template>(`/templates/${templateId}`);
  }

  /**
   * Get a specific template by slug
   */
  async getTemplateBySlug(slug: string): Promise<Template> {
    return this.get<Template>(`/templates/slug/${slug}`);
  }

  /**
   * Create a new template
   */
  async createTemplate(data: TemplateCreate): Promise<Template> {
    return this.post<Template>('/templates/', data);
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId: number, data: TemplateUpdate): Promise<Template> {
    return this.put<Template>(`/templates/${templateId}`, data);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: number): Promise<void> {
    return this.delete<void>(`/templates/${templateId}`);
  }
}

export const templateApi = new TemplateApi();
