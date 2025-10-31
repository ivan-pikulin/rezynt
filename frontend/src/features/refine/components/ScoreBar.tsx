import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { COLORS } from '../../../shared/theme/theme';

type ScoreBarProps = {
  score: number; // 0-100
  label: string;
  subtitle: string;
  marketingText: string;
};

const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const ScoreBar: React.FC<ScoreBarProps> = ({ score, label, subtitle, marketingText }) => {
  const normalized = clamp(score, 0, 100);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: { xs: 2, md: 3 },
        bgcolor: COLORS.resume.header.background,
        borderBottom: `1px solid ${COLORS.resume.section.border}`,
      }}
    >
      {/* Left: circular score */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={64}
            thickness={4}
            sx={{ color: COLORS.grey[200] }}
          />
          <CircularProgress
            variant="determinate"
            value={normalized}
            size={64}
            thickness={4}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: COLORS.primary.main,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography component="div" variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {Math.round(normalized)}
            </Typography>
            <Typography component="div" variant="caption" sx={{ opacity: 0.7, lineHeight: 1 }}>
              Score
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ m: 0, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.grey[600] }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Right: marketing text */}
      <Box sx={{ maxWidth: 700, ml: 'auto' }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {marketingText}
        </Typography>
      </Box>
    </Box>
  );
};

export default ScoreBar;


