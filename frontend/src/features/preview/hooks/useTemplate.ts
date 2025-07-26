import { useState, useCallback } from 'react';
import { ResumeData } from '../../../shared/types/resume';
import { TemplateService } from '../services/templateService';

/**
 * Хук для работы с шаблонами резюме
 */
export const useTemplate = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('alder');
  const [resumeData, setResumeData] = useState<ResumeData>(TemplateService.createDemoData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Получить все доступные шаблоны
   */
  const getTemplates = useCallback(() => {
    return TemplateService.getTemplates();
  }, []);

  /**
   * Получить текущий выбранный шаблон
   */
  const getCurrentTemplate = useCallback(() => {
    return TemplateService.getTemplateById(selectedTemplateId);
  }, [selectedTemplateId]);

  /**
   * Изменить выбранный шаблон
   */
  const selectTemplate = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setError(null);
  }, []);

  /**
   * Обновить данные резюме
   */
  const updateResumeData = useCallback((newData: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...newData }));
    setError(null);
  }, []);

  /**
   * Валидировать данные резюме
   */
  const validateData = useCallback(() => {
    const validation = TemplateService.validateResumeData(resumeData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
    } else {
      setError(null);
    }
    return validation.isValid;
  }, [resumeData]);

  /**
   * Сбросить данные к демо
   */
  const resetToDemo = useCallback(() => {
    setResumeData(TemplateService.createDemoData());
    setError(null);
  }, []);

  /**
   * Очистить ошибки
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Состояние
    selectedTemplateId,
    resumeData,
    isLoading,
    error,
    
    // Методы
    getTemplates,
    getCurrentTemplate,
    selectTemplate,
    updateResumeData,
    validateData,
    resetToDemo,
    clearError,
    
    // Утилиты
    isDataValid: TemplateService.validateResumeData(resumeData).isValid
  };
}; 