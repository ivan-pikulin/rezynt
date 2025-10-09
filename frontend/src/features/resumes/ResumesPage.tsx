import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../shared/components/Header/Header';
import PaywallModal from '../../shared/components/PaywallModal';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { useUser } from '../../shared/hooks';
import { ResumeData } from '../../shared/types/resume';
import { useResumes } from './hooks/useResumes';
import { COLORS } from '../../shared/theme/theme';

const ResumesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resumes, isLoading, error } = useResumes();
  const { user } = useUser();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleResumeClick = (resumeId: string) => {
    navigate(`/refine?resume_id=${resumeId}`);
  };

  const handleAddResume = () => {
    // Check if user already has resumes and is not pro
    const hasResumes = Array.isArray(resumes) && resumes.length > 0;
    const isPro = user?.is_premium;
    
    if (hasResumes && !isPro) {
      // Show paywall for non-pro users with existing resumes
      setShowPaywall(true);
    } else {
              // Go to resume creation
      navigate('/start');
    }
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
  };

  const handlePaywallSuccess = () => {
    setShowPaywall(false);
            // After successful payment, go to resume creation
    navigate('/start');
  };

  const handleTabChange = (tab: 'resumes' | 'ai-writer' | 'editor') => {
    switch (tab) {
      case 'resumes':
        // Already on resumes page
        break;
      case 'ai-writer':
        // Navigate to chat with first resume if available
        if (Array.isArray(resumes) && resumes.length > 0) {
          navigate(`/chat?resume_id=${resumes[0].id}`);
        } else {
          navigate('/start');
        }
        break;
      case 'editor':
        // Navigate to editor with first resume if available
        if (Array.isArray(resumes) && resumes.length > 0) {
          navigate(`/refine?resume_id=${resumes[0].id}`);
        } else {
          navigate('/start');
        }
        break;
    }
  };

  const convertResumeToDemoData = (resume: any): ResumeData => {
    return {
      id: resume.id,
      user_id: resume.user_id,
      title: resume.title,
      template_slug: resume.template_slug,
      professional_summary: resume.professional_summary,
      conversation_id: resume.conversation_id,
      created_at: resume.created_at,
      updated_at: resume.updated_at,
      first_name: resume.first_name,
      last_name: resume.last_name,
      location: resume.location,
      contacts: resume.contacts || [],
      skills: resume.skills || [],
      experience: resume.experience || [],
      education: resume.education || []
    };
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: COLORS.resume.section.background,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Header 
          showLogo={true} 
          showSteps={false} 
          isProUser={user?.is_premium}
          currentTab="resumes"
          onTabChange={handleTabChange}
        />
        <Typography variant="h6" color="text.secondary">
          {t('resumes.loading')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: COLORS.resume.section.background,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Header 
          showLogo={true} 
          showSteps={false} 
          isProUser={user?.is_premium}
          currentTab="resumes"
          onTabChange={handleTabChange}
        />
        <Typography variant="h6" color="error">
          {t('resumes.error')}: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: COLORS.resume.section.background
    }}>
              {/* Header with logo only */}
      <Header 
        showLogo={true} 
        showSteps={false} 
        isProUser={user?.is_premium}
        currentTab="resumes"
        onTabChange={handleTabChange}
      />
      
              {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        p: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 6 }
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontWeight: 600,
            color: COLORS.resume.text.primary
          }}
        >
          {t('resumes.title')}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          {/* Resume cards */}
          {Array.isArray(resumes) && resumes.map((resume: any) => (
            <Box key={resume.id}>
                              <Card 
                  sx={{ 
                    width: '160px',
                    height: '220px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    bgcolor: COLORS.auth.card.background,
                    borderRadius: '12px',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                onClick={() => handleResumeClick(resume.id)}
              >
                <CardContent sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 1
                }}>
                  {/* Resume title at top */}
                                     <Typography 
                     variant="h6" 
                     component="h2" 
                     sx={{ 
                       fontWeight: 600,
                       color: COLORS.resume.text.primary,
                       mb: 1,
                       textAlign: 'center',
                       fontSize: '0.9rem'
                     }}
                   >
                     {resume.title}
                   </Typography>
                  
                  {/* Resume preview */}
                  <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    borderRadius: '4px',
                    bgcolor: COLORS.auth.card.background,
                    p: 0.5
                  }}>
                    <ResumeRenderer 
                      data={convertResumeToDemoData(resume)} 
                      scale={0.13} 
                      templateId={resume.template_slug || 'nume'}
                      fitToContainer={false}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
          
          {/* Add new resume card */}
          <Box>
            <Card 
              sx={{ 
                                  width: '160px',
                  height: '220px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `2px dashed ${COLORS.common.border}`,
                bgcolor: 'transparent',
                borderRadius: '12px',
                '&:hover': {
                  borderColor: COLORS.primary.main,
                  bgcolor: 'rgba(25, 118, 210, 0.04)',
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={handleAddResume}
            >
              <CardContent sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
              }}>
                <AddIcon sx={{ 
                  fontSize: 28, 
                  color: COLORS.primary.main,
                  mb: 1
                }} />
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 600,
                    color: COLORS.primary.main,
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  {t('resumes.createNew.title')}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ textAlign: 'center', mt: 1, fontSize: '0.75rem' }}
                >
                  {t('resumes.createNew.description')}
                </Typography>
                             </CardContent>
             </Card>
                     </Box>
        </Box>
      </Box>
      
      {/* Paywall Modal */}
      <PaywallModal 
        open={showPaywall}
        onClose={handlePaywallClose}
        onSuccess={handlePaywallSuccess}
      />
    </Box>
  );
};

export default ResumesPage;
