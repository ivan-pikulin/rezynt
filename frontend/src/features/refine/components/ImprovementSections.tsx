import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState } from 'react';
import { AnalysisSection } from '../../../shared/services/api/types';
import ImprovementPoint from './ImprovementPoint';
import { COLORS } from '../../../shared/theme/theme';

type Props = {
  sections: AnalysisSection[];
  onNavigateToField?: (fieldPath: string) => void;
};

const accordionSx = {
  '&:before': { display: 'none' },
  '& .MuiAccordionSummary-root': { 
    minHeight: '48px',
    padding: '12px 16px',
    '&.Mui-expanded': { minHeight: '48px', padding: '12px 16px' }
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

const ImprovementSections: React.FC<Props> = ({ sections, onNavigateToField }) => {
  const [expandedSection, setExpandedSection] = useState<string | false>(false);

  const handleAccordionChange = (panelId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? panelId : false);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, overflow: 'auto' }}>
      {sections.map((s) => {
        const pct = s.percentage;
        const color = statusToColor[s.status as keyof typeof statusToColor];
        const bgColor = statusToBackground[s.status as keyof typeof statusToBackground];
        const statusLabel = s.status === 'NeedsWork' ? 'Needs Work' : s.status;
        const done = s.improvement_points.length;
        const total = done; // All points shown are issues to fix

        const breakdownCard = {
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          marginBottom: '16px',
        };

        const breakdownTitle = {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        };

        const breakdownName = {
          fontSize: '18px',
          fontWeight: 500,
          color: '#1f2937',
        };

        const breakdownCount = {
          fontSize: '14px',
          color: '#6b7280',
        };

        const breakdownProgress = {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
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
            expanded={expandedSection === s.id}
            onChange={handleAccordionChange(s.id)}
            key={s.id}
            sx={{ ...breakdownCard, boxShadow: 'none', ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
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
            <AccordionDetails sx={{ padding: '8px 16px 16px' }}>
              {s.improvement_points.length === 0 ? (
                <Typography sx={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px' }}>
                  No issues found in this section. Great job!
                </Typography>
              ) : (
                s.improvement_points.map((point) => (
                  <ImprovementPoint 
                    key={point.id} 
                    point={point}
                    onNavigateToField={onNavigateToField}
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


