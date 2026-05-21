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
    description: 'Классический профессиональный шаблон с понятной структурой',
    category: 'classic'
  },
  frame: {
    id: 'frame',
    name: 'Frame',
    description: 'Центрированный шаблон с горизонтальными разделителями',
    category: 'classic'
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Двухколоночный шаблон с темной боковой панелью для контактов и навыков',
    category: 'modern'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Шаблон с квадратным логотипом и контактной информацией в шапке',
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
