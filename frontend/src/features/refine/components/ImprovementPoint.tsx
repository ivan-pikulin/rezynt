import React, { useState, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import confetti from 'canvas-confetti';
import { ImprovementPoint as ImprovementPointType, Resume } from '../../../shared/services/api/types';
import { COLORS } from '../../../shared/theme/theme';
import DiffView from './DiffView';
import { getFieldValue, applyFixToResume } from '../utils/resumeFieldPath';

interface Props {
  point: ImprovementPointType;
  resume: Resume;
  onFixApplied?: (updatedResume: Resume) => void;
  onNavigateToField?: (fieldPath: string) => void;
}

const severityColors = {
  high: COLORS.severity.high.main,
  medium: COLORS.severity.medium.main,
  low: COLORS.severity.low.main,
};

const ImprovementPoint: React.FC<Props> = ({ point, resume, onFixApplied, onNavigateToField }) => {
  const [applied, setApplied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Check if fix is available
  const hasFix = !!point.fix_suggestion?.new_content;
  
  // Get original and new content for diff display
  const { originalContent, newContent } = useMemo(() => {
    if (!point.fix_suggestion?.new_content) {
      return { originalContent: undefined, newContent: undefined };
    }
    
    const newContent = point.fix_suggestion.new_content;
    let originalContent: string | undefined;
    
    switch (point.fix_suggestion.type) {
      case 'replace':
        // Get current value from resume
        originalContent = getFieldValue(resume, point.field_path) || '(empty)';
        break;
      
      case 'add':
        // For additions, show current array values or "None"
        const currentValue = getFieldValue(resume, point.field_path);
        if (currentValue) {
          originalContent = `Current: ${currentValue}`;
        } else {
          originalContent = '(no items yet)';
        }
        break;
      
      case 'delete':
        // For deletions, show what will be removed
        originalContent = getFieldValue(resume, point.field_path) || '(empty)';
        break;
    }
    
    return { originalContent, newContent };
  }, [resume, point.fix_suggestion, point.field_path]);

  // Celebration effect on fix applied
  const celebrate = () => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // First burst
    confetti({
      particleCount: 25,
      angle: 60,
      spread: 55,
      origin: { x, y },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
    
    // Second burst
    confetti({
      particleCount: 25,
      angle: 120,
      spread: 55,
      origin: { x, y },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
  };

  const handleApplyFix = () => {
    if (!point.fix_suggestion || !onFixApplied || isAnimating) return;
    
    setIsAnimating(true);
    
    // Apply fix to resume
    const updatedResume = applyFixToResume(resume, point.fix_suggestion);
    
    // Show celebration effect
    celebrate();
    
    // Update resume and navigate to field
    onFixApplied(updatedResume);
    
    // Small delay for visual feedback
    setTimeout(() => {
      setApplied(true);
      setIsAnimating(false);
      
      // Navigate to the field
      if (onNavigateToField) {
        onNavigateToField(point.field_path);
      }
    }, 300);
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
          
          {/* Show diff if fix suggestion available */}
          {hasFix && originalContent && newContent && (
            <DiffView 
              original={originalContent} 
              updated={newContent} 
            />
          )}
          
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
              {hasFix && (
                <Button
                  ref={buttonRef}
                  size="small"
                  variant="contained"
                  onClick={handleApplyFix}
                  disabled={applied || isAnimating}
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    padding: '2px 8px',
                    minWidth: 'auto',
                    backgroundColor: applied ? COLORS.success.main : COLORS.button.primary.background,
                    transition: 'all 0.3s ease',
                    transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
                    '&:hover': {
                      backgroundColor: applied ? COLORS.success.dark : COLORS.button.primary.backgroundHover,
                      transform: applied ? 'scale(1)' : 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  {applied ? '✓ Applied' : isAnimating ? 'Applying...' : 'Apply Fix'}
                </Button>
              )}
              
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
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ImprovementPoint;

