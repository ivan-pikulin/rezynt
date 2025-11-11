import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
// Radio and Button removed to make entire card clickable
import { COLORS } from '../../../shared/theme/theme';
import ResumeRenderer from '../../../shared/components/ResumeRenderer';
import { TemplateService } from '../../../shared/services/templateService';
import { TemplateConfig } from '../../../shared/types/resume';

interface TemplateSelectionCardsProps {
  selectedTemplateId?: string;
  onSelect: (template: TemplateConfig) => void;
  resumeData: any;
}

const descriptions: Array<{ title: string; subtitle: string; bullets: string[] }> = [
  {
    title: 'Classic',
    subtitle: 'Timeless design that conveys authority and experience',
    bullets: ['ATS safe', 'Print-ready', 'Traditional layout', 'Industry standard']
  },
  {
    title: 'Elegant',
    subtitle: 'Bold design for creative professionals and modern industries',
    bullets: ['ATS safe', 'Print-ready', 'Visual impact', 'Executive & Managerial roles']
  },
  {
    title: 'Modern',
    subtitle: 'Clean, contemporary design that stands out in any industry',
    bullets: ['ATS safe', 'Print-ready', 'Clean typography', 'Easy to scan']
  },
  {
    title: 'Professional',
    subtitle: 'Sophisticated template with bold header design',
    bullets: ['ATS safe', 'Print-ready', 'Executive look', 'Distinguished style']
  }
];

const TemplateSelectionCards: React.FC<TemplateSelectionCardsProps> = ({ selectedTemplateId, onSelect, resumeData }) => {
  // Use all four templates
  const templates = ['clarity', 'frame', 'sidebar', 'professional']
    .map(id => TemplateService.getTemplateById(id)!)
    .filter(Boolean);

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { 
        xs: 'repeat(2, 1fr)',  // 2 columns on mobile
        sm: 'repeat(2, 1fr)',  // 2 columns on small screens
        md: 'repeat(4, minmax(200px, 220px))'  // 4 columns on desktop (always in one row)
      },
      justifyContent: { xs: 'stretch', md: 'center' },
      gap: 2 
    }}>
      {templates.map((template, idx) => {
        const isSelected = selectedTemplateId === template.id;
        const content = descriptions[idx] || descriptions[0];
        return (
          <Card 
            key={template.id}
            onClick={() => onSelect(template)}
            sx={{ 
              width: { xs: '100%', md: 220 }, 
              borderRadius: 2, 
              border: `2px solid ${isSelected ? COLORS.primary.main : COLORS.grey[200]}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              {/* Title centered above preview */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                {content.title}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ width: '100%', aspectRatio: '210 / 297', overflow: 'hidden', borderRadius: 1, bgcolor: '#fafafa' }}>
                  <ResumeRenderer data={resumeData} templateId={template.id} isPreview={true} fitToContainer={true} />
                </Box>
              </Box>

            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default TemplateSelectionCards;


