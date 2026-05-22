import React from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../shared/theme/theme';
import ResumeRenderer from '../../../shared/components/ResumeRenderer';
import { TemplateService } from '../../../shared/services/templateService';
import { TemplateConfig } from '../../../shared/types/resume';

interface TemplateSelectionCardsProps {
  selectedTemplateId?: string;
  onSelect: (template: TemplateConfig) => void;
  resumeData: any;
}

const templateIds = ['clarity', 'frame', 'sidebar', 'professional'];

const TemplateSelectionCards: React.FC<TemplateSelectionCardsProps> = ({ selectedTemplateId, onSelect, resumeData }) => {
  const { t } = useTranslation();
  const templates = templateIds
    .map(id => TemplateService.getTemplateById(id)!)
    .filter(Boolean);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || templates[0];

  const getTemplateTitle = (templateId: string) => t(`export.templateSelection.templates.${templateId}`);
  const getMobileTemplateTitle = (templateId: string) => t(`export.templateSelection.mobileTemplates.${templateId}`);

  return (
    <>
      <Box sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }}>
        <Box
          role="tablist"
          aria-label={t('export.templateSelection.tabsAria')}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            alignItems: 'end',
            borderBottom: `1px solid ${COLORS.landing.borderSoft}`,
          }}
        >
          {templates.map((template) => {
            const isSelected = selectedTemplate.id === template.id;
            return (
              <ButtonBase
                key={template.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelect(template)}
                sx={{
                  position: 'relative',
                  minHeight: 46,
                  px: 0.5,
                  pb: 1.25,
                  color: isSelected ? COLORS.primary.main : COLORS.landing.mutedText,
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 800 : 650,
                  lineHeight: 1.12,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  transition: 'color 180ms ease',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 8,
                    bottom: -1,
                    left: 8,
                    height: 2,
                    borderRadius: 999,
                    bgcolor: isSelected ? COLORS.primary.main : 'transparent',
                    transition: 'background-color 180ms ease',
                  },
                }}
              >
                {getMobileTemplateTitle(template.id)}
              </ButtonBase>
            );
          })}
        </Box>

        <Box
          sx={{
            width: 'min(100%, 330px)',
            mx: 'auto',
            mt: 2,
            p: 1.25,
            borderRadius: 3,
            border: `1px solid ${COLORS.landing.borderSoft}`,
            bgcolor: COLORS.landing.surfaceStrong,
            boxShadow: COLORS.landing.shadow,
          }}
        >
          <Box sx={{ width: '100%', aspectRatio: '210 / 297', overflow: 'hidden', borderRadius: 2, bgcolor: COLORS.grey[50] }}>
            <ResumeRenderer data={resumeData} templateId={selectedTemplate.id} isPreview={true} fitToContainer={true} />
          </Box>
        </Box>
      </Box>

      <Box sx={{
        display: { xs: 'none', sm: 'grid' },
        gridTemplateColumns: {
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, minmax(200px, 220px))'
        },
        justifyContent: { sm: 'stretch', md: 'center' },
        gap: 2
      }}>
        {templates.map((template) => {
          const isSelected = selectedTemplate.id === template.id;
          return (
            <Card
              key={template.id}
              onClick={() => onSelect(template)}
              sx={{
                width: { sm: '100%', md: 220 },
                borderRadius: 2,
                border: `2px solid ${isSelected ? COLORS.primary.main : COLORS.grey[200]}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { boxShadow: COLORS.landing.shadow }
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                  {getTemplateTitle(template.id)}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ width: '100%', aspectRatio: '210 / 297', overflow: 'hidden', borderRadius: 1, bgcolor: COLORS.grey[50] }}>
                    <ResumeRenderer data={resumeData} templateId={template.id} isPreview={true} fitToContainer={true} />
                  </Box>
                </Box>

              </CardContent>
            </Card>
          );
        })}
      </Box>
    </>
  );
};

export default TemplateSelectionCards;
