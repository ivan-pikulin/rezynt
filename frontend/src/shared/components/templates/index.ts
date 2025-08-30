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

// Конфигурации доступных шаблонов
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'nume',
    name: 'Clarity',
    description: 'Классический профессиональный шаблон с четкой структурой',
    category: 'classic'
  },
  {
    id: 'vero',
    name: 'Frame',
    description: 'Центрированный шаблон с горизонтальными разделителями',
    category: 'classic'
  },
  {
    id: 'luma',
    name: 'Sidebar',
    description: 'Двухколоночный шаблон с темной боковой панелью для контактов и навыков',
    category: 'modern'
  },
  {
    id: 'alto',
    name: 'Professional',
    description: 'Шаблон с квадратным логотипом и контактной информацией в заголовке',
    category: 'modern'
  }
];

// Фабрика для создания шаблонов
export const createTemplate = (templateId: string, props: any) => {
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