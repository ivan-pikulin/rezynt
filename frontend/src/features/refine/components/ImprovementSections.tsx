import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState, useEffect, useMemo } from 'react';
import { AnalysisSection, Resume } from '../../../shared/services/api/types';
import ImprovementPoint from './ImprovementPoint';
import { COLORS } from '../../../shared/theme/theme';
import { generatePremiumPoints } from '../utils/generatePremiumPoints';

type Props = {
  sections: AnalysisSection[];
  resume: Resume;
  onFixApplied?: (updatedResume: Resume, pointId?: string) => void;
  onNavigateToField?: (fieldPath: string) => void;
  onFixMarked?: (pointId: string) => void;
  dismissedPointIds?: Set<string>;
  isPremium?: boolean;
};

const accordionSx = {
  '&:before': { display: 'none' },
  '& .MuiAccordionSummary-root': { 
    minHeight: '44px',
    padding: '10px 12px',
    '&.Mui-expanded': { minHeight: '44px', padding: '10px 12px' }
  },
  '& .MuiAccordionSummary-content': { margin: 0 },
};

const statusToColor = {
  NeedsWork: COLORS.error.main,      // Red
  Good: COLORS.warning.main,         // Orange
  Strong: COLORS.success.main,       // Green
};

const statusToBackground = {
  NeedsWork: COLORS.error.light,
  Good: COLORS.warning.light,
  Strong: COLORS.success.light,
};

const statusToText = {
  NeedsWork: COLORS.error.text,
  Good: COLORS.warning.text,
  Strong: COLORS.success.text,
};

const ImprovementSections: React.FC<Props> = ({ sections, resume, onFixApplied, onNavigateToField, onFixMarked, dismissedPointIds, isPremium = false }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Initialize all sections as expanded when sections change
  useEffect(() => {
    setExpandedSections(new Set(sections.map(s => s.id)));
  }, [sections]);

  // Generate premium points for non-premium users
  const sectionsWithPremiumPoints = useMemo(() => {
    if (isPremium) {
      return sections;
    }

    return sections.map((section) => {
      // Generate 1-3 random premium points per section
      const premiumPointsCount = Math.floor(Math.random() * 3) + 1;
      const premiumPoints = generatePremiumPoints(section.id, premiumPointsCount);
      
      return {
        ...section,
        improvement_points: [...section.improvement_points, ...premiumPoints],
      };
    });
  }, [sections, isPremium]);

  const handleAccordionChange = (panelId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.add(panelId);
      } else {
        newSet.delete(panelId);
      }
      return newSet;
    });
  };

  return (
    <Box sx={{ pt: 1, px: 2, pb: 2, overflow: 'auto' }}>
      {sectionsWithPremiumPoints.map((s) => {
        const pct = s.percentage;
        const color = statusToColor[s.status as keyof typeof statusToColor];
        const bgColor = statusToBackground[s.status as keyof typeof statusToBackground];
        const statusLabel = s.status === 'NeedsWork' ? 'Needs Work' : s.status;
        const done = s.improvement_points.length;
        const total = done; // All points shown are issues to fix

        const breakdownCard = {
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
          marginBottom: '8px',
        };

        const breakdownTitle = {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        };

        const breakdownName = {
          fontSize: '16px',
          fontWeight: 500,
          color: '#1f2937',
        };

        const breakdownCount = {
          fontSize: '13px',
          color: '#6b7280',
        };

        const breakdownProgress = {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        };

        const progressBar = {
          width: '48px',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          overflow: 'hidden',
        };

        const progressFill = {
          height: '100%',
          borderRadius: '9999px',
          transition: 'width 0.5s',
        };

        const progressScore = {
          fontSize: '14px',
          fontWeight: 500,
        };

        const statusBadge = {
          fontSize: '12px',
          fontWeight: 500,
          padding: '4px 8px',
          borderRadius: '9999px',
        };

        return (
          <Accordion 
            expanded={expandedSections.has(s.id)}
            onChange={handleAccordionChange(s.id)}
            key={s.id}
            sx={{ ...breakdownCard, ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <Box sx={breakdownTitle}>
                  <Typography sx={breakdownName}>{s.title}</Typography>
                  <Typography sx={breakdownCount}>
                    ({done} {done === 1 ? 'issue' : 'issues'})
                  </Typography>
                </Box>
                <Box sx={breakdownProgress}>
                  <Box sx={progressBar}>
                    <Box sx={{ ...progressFill, width: `${pct}%`, backgroundColor: color }}/>
                  </Box>
                  <Typography sx={{ ...progressScore, color }}>{pct}%</Typography>
                  <Box sx={{ 
                    ...statusBadge, 
                    backgroundColor: bgColor, 
                    color: statusToText[s.status as keyof typeof statusToText] 
                  }}>
                    {statusLabel}
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '6px 12px 12px' }}>
              {s.improvement_points.length === 0 ? (
                <Typography sx={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '12px' }}>
                  No issues found in this section. Great job!
                </Typography>
              ) : (
                s.improvement_points.map((point) => (
                  <ImprovementPoint 
                    key={point.id} 
                    point={point}
                    resume={resume}
                    onFixApplied={onFixApplied}
                    onNavigateToField={onNavigateToField}
                    onFixMarked={onFixMarked}
                    isDismissed={dismissedPointIds?.has(point.id) || false}
                    isPremium={isPremium}
                  />
                ))
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default ImprovementSections;


