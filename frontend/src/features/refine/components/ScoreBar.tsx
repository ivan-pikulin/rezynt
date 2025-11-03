import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { getScoreColor } from '../../../shared/theme/theme';

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
  const scoreColor = getScoreColor(normalized).main;
  
  // Animation state for circular progress
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);

  // Trigger animation on mount or score change
  useEffect(() => {
    setStartAnimation(false);
    setAnimatedProgress(0);
    
    // Small delay before starting animation for better UX
    const timer = setTimeout(() => {
      setStartAnimation(true);
      setAnimatedProgress(normalized);
    }, 100);

    return () => clearTimeout(timer);
  }, [normalized]);

  const styles = {
    scoreCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    circularScore: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
    },
    scoreCircle: {
      position: 'relative' as const,
      width: '80px',
      height: '80px',
    },
    scoreNumber: {
      fontSize: '20px',
      fontWeight: 600,
      color: scoreColor,
      lineHeight: 1,
    },
    scoreLabel: {
      fontSize: '12px',
      color: '#6b7280',
      lineHeight: 1,
    },
    scoreStatus: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
    },
    statusText: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#1f2937',
    },
    statusSubtext: {
      fontSize: '13px',
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
            size={80}
            thickness={5}
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
            value={animatedProgress}
            size={80}
            thickness={5}
            sx={{
              position: 'absolute',
              color: scoreColor,
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
            <Typography sx={styles.scoreNumber}>
              {startAnimation ? (
                <CountUp
                  start={0}
                  end={Math.round(normalized)}
                  duration={1.5}
                  delay={0}
                  useEasing={true}
                  easingFn={(t, b, c, d) => {
                    // Custom easing function - ease-out cubic
                    t /= d;
                    t--;
                    return c * (t * t * t + 1) + b;
                  }}
                />
              ) : (
                0
              )}
            </Typography>
            <Typography sx={styles.scoreLabel}>Score</Typography>
          </Box>
        </Box>
        <Box sx={{
          ...styles.scoreStatus,
          opacity: startAnimation ? 1 : 0,
          transform: startAnimation ? 'translateX(0)' : 'translateX(-10px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
        }}>
          <Typography sx={styles.statusText}>{label}</Typography>
          <Typography sx={styles.statusSubtext}>{subtitle}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ScoreBar;


