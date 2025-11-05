import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { COLORS } from '../../../shared/theme/theme';

interface Props {
  original: string;
  updated: string;
}

/**
 * Display diff between original and updated text (git-style)
 */
const DiffView: React.FC<Props> = ({ original, updated }) => {
  return (
    <Box
      sx={{
        marginTop: '8px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}
    >
      {/* Original (removed) */}
      <Box
        sx={{
          backgroundColor: '#fef2f2',
          padding: '8px 12px',
          borderLeft: '3px solid #ef4444',
        }}
      >
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#991b1b',
            marginBottom: '4px',
          }}
        >
          - Original
        </Typography>
        <Typography
          sx={{
            fontSize: '12px',
            color: '#7f1d1d',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {original}
        </Typography>
      </Box>

      {/* Updated (added) */}
      <Box
        sx={{
          backgroundColor: '#f0fdf4',
          padding: '8px 12px',
          borderLeft: '3px solid #22c55e',
        }}
      >
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#166534',
            marginBottom: '4px',
          }}
        >
          + Suggested
        </Typography>
        <Typography
          sx={{
            fontSize: '12px',
            color: '#14532d',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {updated}
        </Typography>
      </Box>
    </Box>
  );
};

export default DiffView;

