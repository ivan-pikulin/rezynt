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
    category: 'classic',
    isPremium: false
  },
  vero: {
    id: 'vero',
    name: 'Frame',
    description: 'Centered template with horizontal separators',
    category: 'classic',
    isPremium: false
  },
  luma: {
    id: 'luma',
    name: 'Sidebar',
    description: 'Two-column template with dark sidebar for contacts and skills',
    category: 'modern',
    isPremium: true
  },
  alto: {
    id: 'alto',
    name: 'Professional',
    description: 'Template with square logo and contact information in header',
    category: 'modern',
    isPremium: true
  }
};

// Factory for creating templates
export function createTemplate(templateId: string, props: BaseTemplateProps): React.ReactElement | null {
  switch (templateId) {
    case 'nume':
      return React.createElement(NumeTemplate, props);
    case 'luma':
      return React.createElement(LumaTemplate, props);

    case 'alto':
      return React.createElement(AltoTemplate, props);
    case 'vero':
      return React.createElement(VeroTemplate, props);
    default:
      throw new Error(`Template with id "${templateId}" not found`);
  }
}; 