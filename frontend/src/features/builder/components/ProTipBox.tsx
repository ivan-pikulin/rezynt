import React from 'react';
import { Box, Typography } from '@mui/material';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import { COLORS } from '../../../shared/theme/theme';

interface ProTipBoxProps {
  title: string;
  description: string;
}

export const ProTipBox: React.FC<ProTipBoxProps> = ({ title, description }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '34px minmax(0, 1fr)',
      gap: 1.5,
      p: 2,
      borderRadius: '12px',
      border: `1px solid ${COLORS.grey[200]}`,
      background: `linear-gradient(180deg, ${COLORS.primary.ultraLight} 0%, ${COLORS.secondary.light} 100%)`,
      boxShadow: `0 10px 24px ${COLORS.common.shadow}`,
    }}
  >
    <Box
      aria-hidden="true"
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.primary.main,
        backgroundColor: COLORS.primary.light,
      }}
    >
      <TipsAndUpdatesRoundedIcon sx={{ fontSize: 19 }} />
    </Box>

    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{
          color: COLORS.resume.text.primary,
          fontWeight: 700,
          mb: 0.75,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: COLORS.resume.text.secondary,
          lineHeight: 1.55,
        }}
      >
        {description}
      </Typography>
    </Box>
  </Box>
);
