import React from 'react';
import { Box, Typography } from '@mui/material';
import { BuilderState } from '../types/builder';
import { COLORS } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';

interface SummaryStepProps {
  state: BuilderState;
  onUpdate: <K extends keyof BuilderState>(field: K, value: BuilderState[K]) => void;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ state, onUpdate }) => {
  const { t } = useTranslation();

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
        {t('builder.summary.title')}
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 3,
          color: COLORS.resume.text.secondary,
          fontSize: '14px',
        }}
      >
        {t('builder.summary.description')}
      </Typography>

      <textarea
        placeholder={t('builder.summary.placeholder')}
        value={state.professional_summary || ''}
        onChange={(e) => onUpdate('professional_summary', e.target.value)}
        rows={8}
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
          e.target.style.borderColor = '#2563eb';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb';
        }}
      />

      <Box 
        sx={{ 
          mt: 2,
          p: 2, 
          backgroundColor: COLORS.primary.light,
          borderRadius: '8px',
          border: `1px solid ${COLORS.primary.main}`,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
          💡 {t('builder.summary.tip')}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.resume.text.secondary }}>
          {t('builder.summary.tipDescription')}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: COLORS.resume.text.secondary }}>
          {t('builder.summary.characterCount')}: {(state.professional_summary || '').length}
        </Typography>
      </Box>
    </Box>
  );
};

