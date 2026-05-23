import React from 'react';
import { Box, Typography } from '@mui/material';
import { BuilderState, BuilderUpdateHandler } from '../types/builder';
import { COLORS } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';
import { ProTipBox } from './ProTipBox';

interface SummaryStepProps {
  state: BuilderState;
  onUpdate: BuilderUpdateHandler;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ state, onUpdate }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
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
          e.target.style.borderColor = COLORS.primary.main;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb';
        }}
      />

      <Box sx={{ mt: 2 }}>
        <ProTipBox
          title={t('builder.summary.tip')}
          description={t('builder.summary.tipDescription')}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: COLORS.resume.text.secondary }}>
          {t('builder.summary.characterCount')}: {(state.professional_summary || '').length}
        </Typography>
      </Box>
    </Box>
  );
};
