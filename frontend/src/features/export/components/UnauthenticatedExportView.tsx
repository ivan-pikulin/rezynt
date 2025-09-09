import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useMediaQuery } from '@mui/material';
import React from 'react';
import ResumeRenderer from '../../../shared/components/ResumeRenderer';
import { COLORS } from '../../../shared/theme/theme';
import { convertApiResumeToDisplayData } from '../../refine/utils/resumeDataConverter';
import { Resume } from '../../../shared/services/api/types';

interface UnauthenticatedExportViewProps {
  resume: Resume;
  selectedTemplateId?: string;
  onDownloadClick: () => void;
}

const UnauthenticatedExportView: React.FC<UnauthenticatedExportViewProps> = ({
  resume,
  selectedTemplateId,
  onDownloadClick
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const displayData = convertApiResumeToDisplayData(resume);

  const benefits = [
    'Your resume is recruiter-ready',
    'Optimized for all ATS systems',
    'Boost your interview chances',
    'Publish and get more offers',
    'Download and start applying today'
  ];

  const mobileBenefits = [benefits[0], benefits[1], benefits[4]]; // 1, 2, 5 пункты
  const displayBenefits = isMobile ? mobileBenefits : benefits;

  return (
    <Card sx={{
      width: '100%',
      maxWidth: isMobile ? 'calc(100vw - 24px)' : '750px',
      maxHeight: isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 120px)',
      bgcolor: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      boxShadow: isMobile ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.12)',
      p: 3,
      overflow: 'auto'
    }}>
      <CardContent sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 4,
        alignItems: isMobile ? 'center' : 'flex-start',
        p: 0
      }}>
        {/* Resume Preview */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: isMobile ? 'none' : 1,
          maxWidth: isMobile ? '300px' : '350px',
          maxHeight: isMobile ? '400px' : '450px'
        }}>
          {isMobile ? (
            <ResumeRenderer
              data={displayData}
              scale={0.2}
              templateId={selectedTemplateId}
              fitToContainer={!isMobile}
              isPreview={true}
            />
          ) : (
            <Box sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: COLORS.grey[50],
              borderRadius: '12px',
              border: `2px solid ${COLORS.grey[200]}`,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}>
              <ResumeRenderer
                data={displayData}
                scale={0.25}
                templateId={selectedTemplateId}
                fitToContainer={true}
                isPreview={true}
              />
            </Box>
          )}
        </Box>

        {/* Benefits and Button */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          flex: isMobile ? 'none' : 1,
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          {/* Benefits List */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: isMobile ? '400px' : 'none',
            bgcolor: 'transparent',
            borderRadius: 'none',
            p: 0,
            border: 'none'
          }}>
            {displayBenefits.map((benefit, index) => (
              <React.Fragment key={index}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 1.5 : 2.5,
                  py: isMobile ? 1.5 : 2.5,
                  position: 'relative'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isMobile ? '20px' : '28px',
                    height: isMobile ? '20px' : '28px',
                    borderRadius: '50%',
                    bgcolor: '#4caf50',
                    flexShrink: 0,
                    boxShadow: isMobile ? 'none' : '0 2px 8px rgba(76, 175, 80, 0.3)'
                  }}>
                    <CheckCircleIcon sx={{
                      color: 'white',
                      fontSize: isMobile ? '0.8rem' : '1.1rem'
                    }} />
                  </Box>
                  <Typography variant="body1" sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: isMobile ? '0.8rem' : '1.05rem',
                    lineHeight: isMobile ? 1.3 : 1.5,
                    letterSpacing: isMobile ? 'normal' : '0.01em'
                  }}>
                    {benefit}
                  </Typography>
                </Box>
                {index < displayBenefits.length - 1 && (
                  <Divider 
                    sx={{ 
                      borderColor: '#e0e0e0',
                      '&::before, &::after': {
                        borderColor: '#e0e0e0'
                      }
                    }} 
                  />
                )}
              </React.Fragment>
            ))}
          </Box>

          {/* Download Button */}
          <Button
            variant="contained"
            size="medium"
            onClick={onDownloadClick}
            sx={{
              bgcolor: COLORS.primary.main,
              color: 'white',
              py: isMobile ? 1.5 : 2,
              px: isMobile ? 3 : 4,
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: isMobile ? 600 : 700,
              borderRadius: isMobile ? '8px' : '12px',
              textTransform: 'none',
              boxShadow: isMobile ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 4px 16px rgba(107, 127, 215, 0.4)',
              width: isMobile ? '100%' : '350px',
              letterSpacing: isMobile ? 'normal' : '0.02em',
              '&:hover': {
                bgcolor: COLORS.primary.dark,
                transform: isMobile ? 'none' : 'translateY(-2px)',
                boxShadow: isMobile ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 6px 20px rgba(107, 127, 215, 0.5)'
              },
              '&:active': isMobile ? {} : {
                transform: 'translateY(0px)',
                boxShadow: '0 2px 8px rgba(107, 127, 215, 0.4)'
              },
              transition: isMobile ? 'all 0.2s ease' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Download Your Resume
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnauthenticatedExportView;
