import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

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

const getScoreColor = (score: number) => {
  if (score < 40) return '#ef4444'; // red
  if (score < 70) return '#f97316'; // orange
  return '#22c55e'; // green
};

const ScoreBar: React.FC<ScoreBarProps> = ({ score, label, subtitle, marketingText }) => {
  const normalized = clamp(score, 0, 100);
  const scoreColor = getScoreColor(normalized);

  const styles = {
    scoreCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    circularScore: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
    },
    scoreCircle: {
      position: 'relative' as const,
      width: '120px',
      height: '120px',
    },
    scoreNumber: {
      fontSize: '26px',
      fontWeight: 600,
      color: scoreColor,
      lineHeight: 1,
    },
    scoreLabel: {
      fontSize: '14px',
      color: '#6b7280',
      lineHeight: 1,
    },
    scoreStatus: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
    },
    statusText: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#1f2937',
    },
    statusSubtext: {
      fontSize: '14px',
      color: '#6b7280',
    },
  };

  return (
    <Box sx={styles.scoreCard}>
      <Box sx={styles.circularScore}>
        <Box sx={styles.scoreCircle}>
          {/* Background gray ring */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={120}
            thickness={6}
            sx={{
              position: 'absolute',
              color: '#e5e7eb',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          {/* Progress ring */}
          <CircularProgress
            variant="determinate"
            value={normalized}
            size={120}
            thickness={6}
            sx={{
              position: 'absolute',
              color: scoreColor,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}>
            <Typography sx={styles.scoreNumber}>{Math.round(normalized)}</Typography>
            <Typography sx={styles.scoreLabel}>Score</Typography>
          </Box>
        </Box>
        <Box sx={styles.scoreStatus}>
          <Typography sx={styles.statusText}>{label}</Typography>
          <Typography sx={styles.statusSubtext}>{subtitle}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ScoreBar;


