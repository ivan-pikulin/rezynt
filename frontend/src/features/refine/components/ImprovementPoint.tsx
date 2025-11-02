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
      title: point.title
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
        <Box
          sx={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: severityColors[point.severity],
            marginTop: '6px',
            flexShrink: 0,
          }}
        />
        
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '4px',
            }}
          >
            {point.title}
          </Typography>
          
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 400,
              color: '#6b7280',
              marginBottom: '4px',
            }}
          >
            {point.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '8px' }}>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6b7fd7',
              }}
            >
              +{point.score_impact} points
            </Typography>
            
            <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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

