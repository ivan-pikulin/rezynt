import React from 'react';
import { Box } from '@mui/material';
import { COLORS } from '../theme/theme';

interface GradientSpinnerAnimationProps {
  size?: number;
  thickness?: number;
}

const GradientSpinnerAnimation: React.FC<GradientSpinnerAnimationProps> = ({ 
  size = 40,
  thickness = 4 
}) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `conic-gradient(${COLORS.primary.main}, ${COLORS.primary.light}, ${COLORS.primary.main})`,
        animation: 'spin 1s linear infinite',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: `${thickness}px`,
          left: `${thickness}px`,
          right: `${thickness}px`,
          bottom: `${thickness}px`,
          borderRadius: '50%',
          bgcolor: 'background.default'
        },
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }}
    />
  );
};

export default GradientSpinnerAnimation;
