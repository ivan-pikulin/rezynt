import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ImprovementPoint as ImprovementPointType } from '../../../shared/services/api/types';
import { analysisApi } from '../../../shared/services/api';
import { COLORS } from '../../../shared/theme/theme';

interface Props {
  point: ImprovementPointType;
  onFixApplied?: (pointId: string, fixed: string) => void;
  onNavigateToField?: (fieldPath: string) => void;
}

const severityColors = {
  high: COLORS.severity.high.main,
  medium: COLORS.severity.medium.main,
  low: COLORS.severity.low.main,
};

const severityBackgrounds = {
  high: COLORS.severity.high.background,
  medium: COLORS.severity.medium.background,
  low: COLORS.severity.low.background,
};

const severityTexts = {
  high: COLORS.severity.high.text,
  medium: COLORS.severity.medium.text,
  low: COLORS.severity.low.text,
};

const severityIcons = {
  high: '🔴',
  medium: '🟠',
  low: '🟡',
};

const ImprovementPoint: React.FC<Props> = ({ point, onFixApplied, onNavigateToField }) => {
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
    console.log('🎯 Go to Edit clicked:', {
      pointId: point.id,
      fieldPath: point.field_path,
      message: point.message
    });
    
    console.log('🔗 onNavigateToField exists:', !!onNavigateToField);
    console.log('🔗 onNavigateToField type:', typeof onNavigateToField);
    
    if (onNavigateToField) {
      console.log('📞 Calling onNavigateToField with:', point.field_path);
      onNavigateToField(point.field_path);
      console.log('✅ onNavigateToField called successfully');
    } else {
      console.error('❌ onNavigateToField is not defined!');
    }
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
            <Box
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                color: severityTexts[point.severity],
                backgroundColor: severityBackgrounds[point.severity],
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              +{point.score_impact} points
            </Box>
            
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
                    backgroundColor: fixed ? COLORS.success.main : COLORS.button.primary.background,
                    '&:hover': {
                      backgroundColor: fixed ? COLORS.success.dark : COLORS.button.primary.backgroundHover,
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

