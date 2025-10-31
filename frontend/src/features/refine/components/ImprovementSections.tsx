import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';
import { COLORS } from '../../../shared/theme/theme';

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

const statusToChip: Record<SectionStatus, { label: string; color: string; bg: string }> = {
  NeedsWork: { label: 'Needs Work', color: '#fff', bg: '#ef5350' },
  Good: { label: 'Good', color: '#111', bg: '#ffcc80' },
  Strong: { label: 'Strong', color: '#fff', bg: '#66bb6a' },
};

const ImprovementSections: React.FC<Props> = ({ sections }) => {
  return (
    <Box sx={{ p: { xs: 1, md: 2 }, overflow: 'auto' }}>
      {sections.map((s) => {
        const pct = s.total === 0 ? 100 : Math.round((s.done / s.total) * 100);
        const chip = statusToChip[s.status];
        return (
          <Accordion key={s.id} disableGutters sx={{ mb: 1, border: `1px solid ${COLORS.resume.section.border}` }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: COLORS.resume.header.background }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography sx={{ flex: 1, fontWeight: 600 }}>{s.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>{s.done}/{s.total}</Typography>
                <Chip
                  size="small"
                  label={chip.label}
                  sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 600 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>{pct}%</Typography>
              </Box>
              {/* Placeholder for future detailed tips per section */}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default ImprovementSections;


