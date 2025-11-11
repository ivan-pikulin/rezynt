import React from 'react';
import { BaseTemplate } from './BaseTemplate';
import { SidebarTemplate } from './SidebarTemplate';
import { ClarityTemplate } from './ClarityTemplate';
import { BaseTemplateProps } from './types';

import { TemplateConfig } from '../../types/resume';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { FrameTemplate } from './FrameTemplate';

export { ProfessionalTemplate, BaseTemplate, SidebarTemplate, ClarityTemplate, FrameTemplate };
export type { BaseTemplateProps, TemplateConfig };

// Available template configurations
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  clarity: {
    id: 'clarity',
    name: 'Clarity',
    description: 'Classic professional template with clear structure',
    category: 'classic'
  },
  frame: {
    id: 'frame',
    name: 'Frame',
    description: 'Centered template with horizontal separators',
    category: 'classic'
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Two-column template with dark sidebar for contacts and skills',
    category: 'modern'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Template with square logo and contact information in header',
    category: 'modern'
  }
};

// Factory for creating templates
export function createTemplate(templateId: string, props: BaseTemplateProps): React.ReactElement | null {
  switch (templateId) {
    case 'clarity':
      return React.createElement(ClarityTemplate, props);
    case 'sidebar':
      return React.createElement(SidebarTemplate, props);

    case 'professional':
      return React.createElement(ProfessionalTemplate, props);
    case 'frame':
      return React.createElement(FrameTemplate, props);
    default:
      throw new Error(`Template with id "${templateId}" not found`);
  }
}; 