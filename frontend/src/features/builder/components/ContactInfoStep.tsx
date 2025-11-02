import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BuilderState } from '../types/builder';
import { COLORS } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';

// Simple input component
const SimpleInput: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}> = ({ placeholder, value, onChange, type = 'text', required = false }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={{
        width: '100%',
        fontSize: '12px',
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #e5e7eb',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s ease-in-out',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#2563eb';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
      }}
    />
  );
};

interface ContactInfoStepProps {
  state: BuilderState;
  onUpdate: <K extends keyof BuilderState>(field: K, value: BuilderState[K]) => void;
}

export const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ state, onUpdate }) => {
  const { t } = useTranslation();

  const handlePersonalInfoChange = (field: string, value: string) => {
    onUpdate('personal_info', {
      ...state.personal_info,
      [field]: value,
    });
  };

  const handleContactChange = (field: string, value: string) => {
    onUpdate('personal_info', {
      ...state.personal_info,
      contacts: {
        ...state.personal_info?.contacts,
        [field]: value,
      },
    });
  };

  const getFieldValue = (field: string): string => {
    return (state.personal_info as any)?.[field] || '';
  };

  const getContactValue = (field: string): string => {
    return (state.personal_info?.contacts as any)?.[field] || '';
  };

  const isFieldValid = (value: string): boolean => {
    return value.trim().length > 0;
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600, 
          mb: 1,
          color: COLORS.resume.text.primary,
          fontSize: '1.5rem',
        }}
      >
        {t('builder.contactInfo.title')}
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 3,
          color: COLORS.resume.text.secondary,
          fontSize: '14px',
        }}
      >
        {t('builder.contactInfo.description')}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Box sx={{ position: 'relative' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 0.5, 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {t('builder.contactInfo.fullName')}
              {isFieldValid(getFieldValue('first_name') + getFieldValue('last_name')) && (
                <CheckCircleIcon sx={{ fontSize: 16, color: COLORS.success.main }} />
              )}
            </Typography>
            <SimpleInput
              placeholder={t('builder.contactInfo.fullNamePlaceholder')}
              value={`${getFieldValue('first_name')} ${getFieldValue('last_name')}`.trim()}
              onChange={(value) => {
                const parts = value.split(' ');
                const firstName = parts[0] || '';
                const lastName = parts.slice(1).join(' ') || '';
                handlePersonalInfoChange('first_name', firstName);
                handlePersonalInfoChange('last_name', lastName);
              }}
            />
          </Box>
        </Box>

        <Box>
          <Box sx={{ position: 'relative' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 0.5, 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {t('builder.contactInfo.email')} *
              {isFieldValid(getContactValue('email')) && (
                <CheckCircleIcon sx={{ fontSize: 16, color: COLORS.success.main }} />
              )}
            </Typography>
            <SimpleInput
              type="email"
              placeholder={t('builder.contactInfo.emailPlaceholder')}
              value={getContactValue('email')}
              onChange={(value) => handleContactChange('email', value)}
              required
            />
          </Box>
        </Box>

        <Box>
          <Box sx={{ position: 'relative' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 0.5, 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {t('builder.contactInfo.phone')}
              {isFieldValid(getContactValue('phone')) && (
                <CheckCircleIcon sx={{ fontSize: 16, color: COLORS.success.main }} />
              )}
            </Typography>
            <SimpleInput
              type="tel"
              placeholder={t('builder.contactInfo.phonePlaceholder')}
              value={getContactValue('phone')}
              onChange={(value) => handleContactChange('phone', value)}
            />
          </Box>
        </Box>

        <Box>
          <Box sx={{ position: 'relative' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 0.5, 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {t('builder.contactInfo.city')}
              {isFieldValid(getFieldValue('city')) && (
                <CheckCircleIcon sx={{ fontSize: 16, color: COLORS.success.main }} />
              )}
            </Typography>
            <SimpleInput
              placeholder={t('builder.contactInfo.cityPlaceholder')}
              value={getFieldValue('city')}
              onChange={(value) => handlePersonalInfoChange('city', value)}
            />
          </Box>
        </Box>

        <Box>
          <Box sx={{ position: 'relative' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 0.5, 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {t('builder.contactInfo.country')}
              {isFieldValid(getFieldValue('country')) && (
                <CheckCircleIcon sx={{ fontSize: 16, color: COLORS.success.main }} />
              )}
            </Typography>
            <SimpleInput
              placeholder={t('builder.contactInfo.countryPlaceholder')}
              value={getFieldValue('country')}
              onChange={(value) => handlePersonalInfoChange('country', value)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

