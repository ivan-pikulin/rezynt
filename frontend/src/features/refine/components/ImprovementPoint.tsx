import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ImprovementPoint as ImprovementPointType } from '../../../shared/services/api/types';
import { analysisApi } from '../../../shared/services/api';

interface Props {
  point: ImprovementPointType;
  onFixApplied?: (pointId: string, fixed: string) => void;
}

const severityColors = {
  high: '#ef4444',
  medium: '#f97316',
  low: '#fbbf24',
};

const severityIcons = {
  high: '🔴',
  medium: '🟠',
  low: '🟡',
};

const ImprovementPoint: React.FC<Props> = ({ point, onFixApplied }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixed, setFixed] = useState<string | null>(null);

  const handleFix = async () => {
    setIsFixing(true);
    try {
      const response = await analysisApi.applyFix(point.id, point.field_path);
      setFixed(response.fixed);
      if (onFixApplied) {
        onFixApplied(point.id, response.fixed);
      }
    } catch (error) {
      console.error('Error applying fix:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const handleGoToEdit = () => {
    // TODO: Implement navigation to builder with field focus
    console.log('Navigate to edit:', point.field_path);
  };

  return (
    <Box
      sx={{
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '6px',
        borderLeft: `3px solid ${severityColors[point.severity]}`,
        marginBottom: '8px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Typography sx={{ fontSize: '16px', marginTop: '2px' }}>
          {severityIcons[point.severity]}
        </Typography>
        
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#1f2937',
              marginBottom: '4px',
            }}
          >
            {point.message}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#6b7280',
              }}
            >
              +{point.score_impact} points
            </Typography>
            
            <Box sx={{ display: 'flex', gap: '4px' }}>
              {(point.action_type === 'go_to_edit' || point.action_type === 'both') && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleGoToEdit}
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    padding: '2px 8px',
                    minWidth: 'auto',
                  }}
                >
                  Go to Edit
                </Button>
              )}
              
              {(point.action_type === 'fix' || point.action_type === 'both') && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleFix}
                  disabled={isFixing || fixed !== null}
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    padding: '2px 8px',
                    minWidth: 'auto',
                    backgroundColor: fixed ? '#10b981' : '#2563eb',
                    '&:hover': {
                      backgroundColor: fixed ? '#059669' : '#1d4ed8',
                    },
                  }}
                >
                  {isFixing ? (
                    <CircularProgress size={12} sx={{ color: 'white' }} />
                  ) : fixed ? (
                    '✓ Fixed'
                  ) : (
                    'Fix'
                  )}
                </Button>
              )}
            </Box>
          </Box>
          
          {fixed && (
            <Box
              sx={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f0fdf4',
                borderRadius: '4px',
                border: '1px solid #86efac',
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#166534',
                  fontWeight: 500,
                  marginBottom: '4px',
                }}
              >
                Suggested fix:
              </Typography>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#15803d',
                }}
              >
                {fixed}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ImprovementPoint;

