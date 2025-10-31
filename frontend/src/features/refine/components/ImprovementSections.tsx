import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';

export type SectionStatus = 'NeedsWork' | 'Good' | 'Strong';

export type ImprovementSection = {
  id: string;
  title: string;
  total: number;
  done: number;
  status: SectionStatus;
};

type Props = {
  sections: ImprovementSection[];
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

const statusToColor: Record<SectionStatus, string> = {
  NeedsWork: '#ef4444',
  Good: '#f97316',
  Strong: '#22c55e',
};

const statusToBackground: Record<SectionStatus, string> = {
  NeedsWork: '#fef2f2',
  Good: '#fff7ed',
  Strong: '#f0fdf4',
};

const ImprovementSections: React.FC<Props> = ({ sections }) => {
  return (
    <Box sx={{ p: { xs: 1, md: 2 }, overflow: 'auto' }}>
      {sections.map((s) => {
        const pct = s.total === 0 ? 100 : Math.round((s.done / s.total) * 100);
        const color = statusToColor[s.status];
        const bgColor = statusToBackground[s.status];
        const statusLabel = s.status === 'NeedsWork' ? 'Needs Work' : s.status;

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
            expanded={false} 
            key={s.id}
            sx={{ ...breakdownCard, boxShadow: 'none', ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <Box sx={breakdownTitle}>
                  <Typography sx={breakdownName}>{s.title}</Typography>
                  <Typography sx={breakdownCount}>({s.done}/{s.total})</Typography>
                </Box>
                <Box sx={breakdownProgress}>
                  <Box sx={progressBar}>
                    <Box sx={{ ...progressFill, width: `${pct}%`, backgroundColor: color }}/>
                  </Box>
                  <Typography sx={{ ...progressScore, color }}>{pct}</Typography>
                  <Box sx={{ ...statusBadge, backgroundColor: bgColor, color }}>
                    {statusLabel}
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default ImprovementSections;


