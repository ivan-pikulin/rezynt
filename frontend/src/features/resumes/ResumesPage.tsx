import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { useResumes } from './hooks/useResumes';
import { ResumeData } from '../../shared/types/resume';
import { TemplateService } from '../../shared/services/templateService';

const ResumesPage: React.FC = () => {
  const navigate = useNavigate();
  const { resumes, isLoading, error } = useResumes();

  const handleResumeClick = (resumeId: string) => {
    navigate(`/refine?resume_id=${resumeId}`);
  };

  const handleAddResume = () => {
    navigate('/start');
  };

  const convertResumeToDemoData = (resume: any): ResumeData => {
    return {
      personalInfo: {
        firstName: resume.personal_info?.first_name || '',
        lastName: resume.personal_info?.last_name || '',
        middleName: resume.personal_info?.middle_name || '',
        phone: resume.personal_info?.phone || '',
        email: resume.personal_info?.email || '',
        location: resume.personal_info?.location || ''
      },
      professionalSummary: resume.professional_summary || '',
      skills: resume.skills?.map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category
      })) || [],
      experience: resume.experience?.map((exp: any) => ({
        id: exp.id,
        jobTitle: exp.job_title,
        company: exp.company,
        location: exp.location || '',
        startDate: exp.start_date,
        endDate: exp.end_date,
        isCurrent: exp.is_current,
        responsibilities: exp.responsibilities || []
      })) || [],
      education: resume.education?.map((edu: any) => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location || '',
        graduationDate: edu.graduation_date,
        fieldOfStudy: edu.field_of_study
      })) || []
    };
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f5f6fa',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Header showLogo={true} showSteps={false} />
        <Typography variant="h6" color="text.secondary">
          Loading resumes...
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
        bgcolor: '#f5f6fa',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Header showLogo={true} showSteps={false} />
        <Typography variant="h6" color="error">
          Error loading resumes: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Шапка только с логотипом */}
      <Header showLogo={true} showSteps={false} />
      
      {/* Основная область */}
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
            color: '#2c3e50'
          }}
        >
          My Resumes
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {/* Карточки резюме */}
          {resumes?.map((resume) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={resume.id}>
              <Card 
                sx={{ 
                  height: '400px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
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
                  {/* Превью резюме */}
                  <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    overflow: 'hidden',
                    borderRadius: '4px',
                    bgcolor: '#f8f9fa',
                    p: 1
                  }}>
                                         <ResumeRenderer 
                       data={convertResumeToDemoData(resume)} 
                       scale={0.3} 
                       templateId={resume.template?.slug || 'tero'}
                     />
                  </Box>
                  
                  {/* Информация о резюме */}
                  <Box sx={{ mt: 1, p: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#2c3e50',
                        mb: 0.5,
                        textAlign: 'center'
                      }}
                    >
                      {resume.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ textAlign: 'center' }}
                    >
                      {resume.template?.name || 'Template'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {/* Карточка добавления нового резюме */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card 
              sx={{ 
                height: '400px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px dashed #ddd',
                bgcolor: 'transparent',
                '&:hover': {
                  borderColor: '#1976d2',
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
                  fontSize: 48, 
                  color: '#1976d2',
                  mb: 2
                }} />
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#1976d2',
                    textAlign: 'center'
                  }}
                >
                  Create New Resume
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ textAlign: 'center', mt: 1 }}
                >
                  Start building your next resume
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ResumesPage;
