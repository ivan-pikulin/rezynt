import React from 'react';
import { BaseTemplate } from './BaseTemplate';
import { BaseTemplateProps } from './types';
import { NumeTemplate } from './NumeTemplate';
import { LumaTemplate } from './LumaTemplate';

import { AltoTemplate } from './AltoTemplate';
import { VeroTemplate } from './VeroTemplate';
import { TemplateConfig } from '../../types/resume';

export { BaseTemplate };
export type { BaseTemplateProps };
export { NumeTemplate, LumaTemplate, AltoTemplate, VeroTemplate };
export type { TemplateConfig };

// Available template configurations
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  nume: {
    id: 'nume',
    name: 'Clarity',
    description: 'Classic professional template with clear structure',
    category: 'classic'
  },
  vero: {
    id: 'vero',
    name: 'Frame',
    description: 'Centered template with horizontal separators',
    category: 'classic'
  },
  luma: {
    id: 'luma',
    name: 'Sidebar',
    description: 'Two-column template with dark sidebar for contacts and skills',
    category: 'modern'
  },
  alto: {
    id: 'alto',
    name: 'Professional',
    description: 'Template with square logo and contact information in header',
    category: 'modern'
  }
};

// Factory for creating templates
export function createTemplate(templateId: string, resumeData: ResumeData): React.ReactElement | null {
  switch (templateId) {
    case 'nume':
      return React.createElement(NumeTemplate, resumeData);
    case 'luma':
      return React.createElement(LumaTemplate, resumeData);

    case 'alto':
      return React.createElement(AltoTemplate, resumeData);
    case 'vero':
      return React.createElement(VeroTemplate, resumeData);
    default:
      throw new Error(`Template with id "${templateId}" not found`);
  }
}; 