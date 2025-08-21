import { ResumeData } from '../../types/resume';

export interface BaseTemplateProps {
  data: ResumeData;
  onExport?: () => void;
  isPreview?: boolean;
  scale?: number; // Добавляем поддержку масштаба
  isEditing?: boolean; // Режим редактирования
  onFieldEdit?: (fieldPath: string, value: string) => void; // Callback для редактирования полей
  onFieldStartEdit?: (fieldPath: string) => void; // Callback для начала редактирования
  onFieldEndEdit?: (fieldPath: string) => void; // Callback для завершения редактирования
  editingField?: string | null; // Текущее редактируемое поле
}

export interface TemplateMethods {
  exportToPDF: () => Promise<void>;
  exportToPNG: () => Promise<string>;
}

// Типы для inline-редактирования
export interface EditableFieldProps {
  value: string;
  fieldPath: string;
  isEditing: boolean;
  onStartEdit: (fieldPath: string) => void;
  onEndEdit: (fieldPath: string) => void;
  onValueChange: (fieldPath: string, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
} 