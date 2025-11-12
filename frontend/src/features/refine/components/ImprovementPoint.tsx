import React, { useState, useMemo, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { ImprovementPoint as ImprovementPointType, Resume } from '../../../shared/services/api/types';
import { analysisApi } from '../../../shared/services/api';
import { COLORS } from '../../../shared/theme/theme';
import DiffView from './DiffView';
import { getFieldValue, applyFixToResume } from '../utils/resumeFieldPath';

interface Props {
  point: ImprovementPointType;
  resume: Resume;
  onFixApplied?: (updatedResume: Resume, pointId?: string) => void;
  onNavigateToField?: (fieldPath: string) => void;
  onFixMarked?: (pointId: string) => void; // Callback to recalculate score after marking as fixed
  isDismissed?: boolean; // Whether this point has been dismissed/applied
  isPremium?: boolean; // Whether user has premium access
}

const severityColors = {
  high: COLORS.severity.high.main,
  medium: COLORS.severity.medium.main,
  low: COLORS.severity.low.main,
};

const ImprovementPoint: React.FC<Props> = ({ point, resume, onFixApplied, onNavigateToField, onFixMarked, isDismissed = false, isPremium = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isPremiumPoint = point.premium_only === true;
  
  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMarkingFixed, setIsMarkingFixed] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const [animatingItems, setAnimatingItems] = useState<Set<number>>(new Set());
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Check if fix is available
  const hasFix = !!point.fix_suggestion?.new_content;
  
  // Helper to normalize content to string for DiffView
  const normalizeContent = (content: string | string[] | undefined): string | undefined => {
    if (!content) return undefined;
    if (Array.isArray(content)) {
      return content.join(', ');
    }
    return content;
  };

  // Get original and new content for diff display
  const { originalContent, newContent, shouldShowItemsList } = useMemo(() => {
    if (!point.fix_suggestion?.new_content) {
      return { originalContent: undefined, newContent: undefined, shouldShowItemsList: false };
    }
    
    const rawNewContent = point.fix_suggestion.new_content;
    const rawOriginalContent = point.fix_suggestion.original_content;
    let originalContent: string | undefined;
    let newContent: string | undefined;
    let shouldShowItemsList = false;
    
    switch (point.fix_suggestion.type) {
      case 'replace':
        // Use original_content from backend if available, otherwise fallback to resume
        const backendOriginal = normalizeContent(rawOriginalContent);
        const resumeOriginal = normalizeContent(getFieldValue(resume, point.field_path));
        originalContent = backendOriginal || resumeOriginal || '(empty)';
        newContent = normalizeContent(rawNewContent);
        break;
      
      case 'add':
        // For additions, always show items list with individual Add buttons
        shouldShowItemsList = true;
        const currentValue = getFieldValue(resume, point.field_path);
        if (Array.isArray(currentValue) && currentValue.length > 0) {
          originalContent = `Current: ${currentValue.join(', ')}`;
        } else {
          originalContent = undefined;
        }
        newContent = normalizeContent(rawNewContent);
        break;
      
      case 'delete':
        // For deletions, show what will be removed
        originalContent = normalizeContent(rawOriginalContent) || normalizeContent(getFieldValue(resume, point.field_path)) || '(empty)';
        newContent = undefined;
        break;
    }
    
    return { originalContent, newContent, shouldShowItemsList };
  }, [resume, point.fix_suggestion, point.field_path]);
  
  // Parse items to add from newContent (always for type='add')
  const itemsToAdd = useMemo(() => {
    if (!shouldShowItemsList || !newContent) return [];
    // Split by comma and trim whitespace
    return newContent.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }, [shouldShowItemsList, newContent]);

  // Check which items are already in resume on mount/update
  useEffect(() => {
    if (!shouldShowItemsList || itemsToAdd.length === 0) return;
    
    // Get current value from resume
    const currentValue = getFieldValue(resume, point.field_path);
    
    if (Array.isArray(currentValue) && currentValue.length > 0) {
      // Check which suggested items are already in the resume
      const alreadyAddedIndices = new Set<number>();
      itemsToAdd.forEach((item, index) => {
        // Check if this item exists in current resume values (case-insensitive)
        if (currentValue.some((existingItem: any) => 
          typeof existingItem === 'string' && 
          existingItem.toLowerCase().trim() === item.toLowerCase().trim()
        )) {
          alreadyAddedIndices.add(index);
        }
      });
      
      if (alreadyAddedIndices.size > 0) {
        setAddedItems(alreadyAddedIndices);
      }
    }
  }, [resume, point.field_path, shouldShowItemsList, itemsToAdd]);

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

  const handleApplyFix = async () => {
    if (!point.fix_suggestion || !onFixApplied || isAnimating) return;
    
    setIsAnimating(true);
    
    // Apply fix to resume
    const updatedResume = applyFixToResume(resume, point.fix_suggestion);
    
    // Show celebration effect
    celebrate();
    
    // Update resume and wait for save to complete
    await onFixApplied(updatedResume, point.id);
    
    // Small delay for visual feedback
    setTimeout(async () => {
      setIsAnimating(false);
      
      // Note: Already marked as dismissed via onFixApplied callback
      // No need to call onFixMarked here as it's already handled
      
      // Navigate to the field
      if (onNavigateToField) {
        onNavigateToField(point.field_path);
      }
    }, 300);
  };

  const handleToggleFixed = async () => {
    if (isMarkingFixed || isDismissed) return; // Block if already dismissed
    
    setIsMarkingFixed(true);
    try {
      // Always mark as fixed (true) since button is disabled if already dismissed
      await analysisApi.markFixed(point.id, true);
      if (onFixMarked) {
        onFixMarked(point.id);
      }
    } catch (error) {
      console.error('Failed to toggle fixed status:', error);
    } finally {
      setIsMarkingFixed(false);
    }
  };

  const handleAddSingleItem = async (item: string, index: number) => {
    if (!point.fix_suggestion || !onFixApplied || animatingItems.has(index)) return;
    
    // Mark item as animating
    setAnimatingItems(prev => new Set(prev).add(index));
    
    // Add single item to resume
    const { addToArrayField } = await import('../utils/resumeFieldPath');
    const updatedResume = addToArrayField(resume, point.field_path, item);
    
    // Show mini celebration
    confetti({
      particleCount: 15,
      angle: 90,
      spread: 45,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
    
    // Update resume and wait for save to complete
    await onFixApplied(updatedResume, point.id);
    
    // Navigate to the field
    if (onNavigateToField) {
      onNavigateToField(point.field_path);
    }
    
    // Mark item as added after animation
    setTimeout(() => {
      setAddedItems(prev => new Set(prev).add(index));
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 300);
  };

  const handleGoToEdit = () => {
    if (onNavigateToField) {
      onNavigateToField(point.field_path);
    }
  };

  return (
    <Box
      sx={{
        padding: '12px',
          backgroundColor: isDismissed ? '#f0fdf4' : 'white',
        borderRadius: '6px',
          borderLeft: `3px solid ${isDismissed ? COLORS.success.main : severityColors[point.severity]}`,
        marginBottom: '8px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          opacity: isDismissed ? 0.85 : 1,
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Fixed badge overlay */}
        {isDismissed && (
        <Box
          sx={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            backgroundColor: COLORS.success.main,
            borderRadius: '12px',
            color: 'white',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: '14px' }} />
          Fixed
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', position: 'relative' }}>
        {/* Blurred content wrapper - covers both dot and content */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            flex: 1,
            filter: isPremiumPoint && !isPremium ? 'blur(3px)' : 'none',
            pointerEvents: isPremiumPoint && !isPremium ? 'none' : 'auto',
            transition: 'filter 0.3s ease',
          }}
        >
        <Box
          sx={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
              backgroundColor: isDismissed ? COLORS.success.main : severityColors[point.severity],
            marginTop: '6px',
            flexShrink: 0,
          }}
        />
        
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
                color: isDismissed ? '#15803d' : '#1f2937',
              marginBottom: '4px',
                textDecoration: isDismissed ? 'line-through' : 'none',
            }}
          >
            {point.title}
          </Typography>
          
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 400,
              color: isDismissed ? '#15803d' : '#6b7280',
              marginBottom: '4px',
            }}
          >
            {point.description}
          </Typography>
          
          {/* Show beautiful list for adding items */}
          {hasFix && shouldShowItemsList && !isDismissed && itemsToAdd.length > 0 && (
            <Box sx={{ 
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f0fdf4',
              borderRadius: '6px',
              borderLeft: `3px solid ${COLORS.success.main}`,
            }}>
              <Typography sx={{ 
                fontSize: '12px', 
                fontWeight: 600, 
                color: COLORS.success.main,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AddCircleOutlineIcon sx={{ fontSize: '16px' }} />
                Items to add:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {itemsToAdd.map((item, index) => {
                  const isAdded = addedItems.has(index);
                  const isAnimating = animatingItems.has(index);
                  
                  return (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        backgroundColor: isAdded ? '#dcfce7' : 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: isAdded ? COLORS.success.main : '#1f2937',
                        transition: 'all 0.3s ease',
                        opacity: isAdded ? 0.7 : 1,
                      }}
                    >
                      <Box sx={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        backgroundColor: COLORS.success.main,
                        flexShrink: 0
                      }} />
                      <Box sx={{ flex: 1, textDecoration: isAdded ? 'line-through' : 'none' }}>
                        {item}
                      </Box>
                      {!isAdded && (
                        <Button
                          size="small"
                          onClick={() => handleAddSingleItem(item, index)}
                          disabled={isAnimating}
                          sx={{
                            fontSize: '10px',
                            textTransform: 'none',
                            padding: '1px 6px',
                            minWidth: 'auto',
                            backgroundColor: COLORS.button.primary.background,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: COLORS.button.primary.backgroundHover,
                            },
                          }}
                        >
                          {isAnimating ? '...' : 'Add'}
                        </Button>
                      )}
                      {isAdded && (
                        <CheckCircleIcon sx={{ fontSize: '14px', color: COLORS.success.main }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
          
          {/* Show diff for other cases */}
          {hasFix && originalContent && newContent && !isDismissed && !shouldShowItemsList && (
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
                color: isDismissed ? COLORS.success.main : '#6b7fd7',
              }}
            >
              {isDismissed ? '✓ ' : '+'}
              {point.score_impact} points
            </Typography>
            
            <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {/* Apply Fix button - only show if not dismissed */}
              {hasFix && !isDismissed && (
                <Button
                  ref={buttonRef}
                  size="small"
                  variant="contained"
                  onClick={handleApplyFix}
                  disabled={isDismissed || isAnimating}
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    padding: '2px 8px',
                    minWidth: 'auto',
                    backgroundColor: isDismissed ? COLORS.success.main : COLORS.button.primary.background,
                    transition: 'all 0.3s ease',
                    transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
                    '&:hover': {
                      backgroundColor: isDismissed ? COLORS.success.dark : COLORS.button.primary.backgroundHover,
                      transform: isDismissed ? 'scale(1)' : 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  {isDismissed ? '✓ Applied' : isAnimating ? 'Applying...' : 'Apply Fix'}
                </Button>
              )}
              
              {/* Toggle fixed status button */}
              <Button
                size="small"
                variant={isDismissed ? "contained" : "outlined"}
                onClick={handleToggleFixed}
                disabled={isMarkingFixed || isDismissed}
                sx={{
                  fontSize: '11px',
                  textTransform: 'none',
                  padding: '2px 8px',
                  minWidth: 'auto',
                  ...(isDismissed && {
                    backgroundColor: COLORS.success.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: COLORS.success.dark,
                    },
                  }),
                }}
              >
                {isDismissed ? '✓ Fixed' : isMarkingFixed ? '...' : 'Mark as Fixed'}
              </Button>
              
              {/* Go to Edit button - show always */}
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
      
      {/* Premium overlay - no blur, covers dot and content */}
      {isPremiumPoint && !isPremium && (
        <Box
          sx={{
            position: 'absolute',
            top: '12px', // Account for padding
            left: '12px', // Account for padding
            right: '12px', // Account for padding
            bottom: '12px', // Account for padding
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '6px',
            zIndex: 10,
            padding: '24px',
            gap: '12px',
            pointerEvents: 'auto',
            filter: 'none', // Explicitly disable blur inheritance
          }}
        >
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1f2937',
              textAlign: 'center',
            }}
          >
            {t('refine.premium.title')}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleUpgradeClick}
            sx={{
              marginTop: '8px',
              borderColor: COLORS.button.primary.background,
              color: COLORS.button.primary.background,
              fontSize: '11px',
              fontWeight: 400,
              padding: '6px 12px',
              textTransform: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'transparent',
              animation: 'pulse 3s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                  transform: 'scale(1)',
                },
                '50%': {
                  opacity: 0.85,
                  transform: 'scale(1.02)',
                },
              },
              '&:hover': {
                borderColor: COLORS.button.primary.backgroundHover,
                backgroundColor: COLORS.button.primary.background,
                color: COLORS.button.primary.text,
                animation: 'none', // Disable pulse on hover
              },
            }}
          >
            {t('refine.premium.button')}
            <TrendingUpIcon sx={{ fontSize: '14px' }} />
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ImprovementPoint;

