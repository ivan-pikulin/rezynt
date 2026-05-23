import React from 'react';
import { COLORS } from '../theme/theme';

interface SimpleInputProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export const SimpleInput: React.FC<SimpleInputProps> = ({ 
  id, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  required = false,
  disabled = false,
  onBlur,
  onKeyPress 
}) => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      required={required}
      disabled={disabled}
      style={{
        width: '100%',
        fontSize: '12px',
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: disabled ? '#f3f4f6' : '#F9FAFB',
        border: '1px solid #e5e7eb',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s ease-in-out',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.target.style.borderColor = COLORS.primary.main;
        }
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
        if (onBlur) onBlur();
      }}
    />
  );
};

interface SimpleTextareaProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export const SimpleTextarea: React.FC<SimpleTextareaProps> = ({ 
  id, 
  placeholder, 
  value, 
  onChange, 
  rows = 2 
}) => {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{
        width: '100%',
        fontSize: '12px',
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #e5e7eb',
        fontFamily: 'inherit',
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color 0.2s ease-in-out',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = COLORS.primary.main;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
      }}
    />
  );
};
