import React from 'react';
import { BaseTemplate } from './BaseTemplate';
import { BaseTemplateProps, TemplateMethods } from './types';
import { AlderTemplate } from './AlderTemplate';
import { TemplateConfig } from '../../types/resume';

export { BaseTemplate };
export type { BaseTemplateProps, TemplateMethods };
export { AlderTemplate };
export type { TemplateConfig };

// Конфигурации доступных шаблонов
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'alder',
    name: 'Alder',
    description: 'Классический профессиональный шаблон с четкой структурой',
    category: 'classic'
  }
];

// Фабрика для создания шаблонов
export const createTemplate = (templateId: string, props: any) => {
  switch (templateId) {
    case 'alder':
      return React.createElement(AlderTemplate, props);
    default:
      throw new Error(`Template with id "${templateId}" not found`);
  }
}; 