import Box from '@mui/material/Box';
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { useAuth } from '../../shared/hooks/useAuth';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { useTemplate } from '../../shared/hooks/useTemplate';
import ErrorMessage from '../refine/components/ErrorMessage';
import LoadingSpinner from '../refine/components/LoadingSpinner';
import { convertApiResumeToDisplayData } from '../refine/utils/resumeDataConverter';
import SuccessPage from './components/SuccessPage';
import { exportApi } from './exportApi';
import RegistrationModal from '../../shared/components/RegistrationModal';
import TemplateSelector from '../refine/components/TemplateSelector';
import Button from '@mui/material/Button';
import { COLORS } from '../../shared/theme/theme';
import PaywallModal from '../../shared/components/PaywallModal';
import Typography from '@mui/material/Typography';
import TemplateSelectionCards from './components/TemplateSelectionCards';

const ExportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const templateContainerRef = useRef<HTMLDivElement>(null);
  
  // No more resume_id in URL - each user has one resume
  const { resume, isLoading: loading, error: queryError, refreshResume } = useResumeQuery(false);
  const { selectedTemplate, updateTemplate } = useTemplate(null, undefined);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const { user, isAuthenticated } = useAuthContext();
  const { user: authUser, isAuthenticated: authAuthenticated, isLoading: authLoading } = useAuth();

  // Check if user is authenticated
  useEffect(() => {
    if (authLoading) return;
    
    if (!authAuthenticated) {
      navigate('/login');
      return;
    }
  }, [authUser, authAuthenticated, authLoading, navigate]);

  const handleBack = () => {
    navigate('/refine');
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start
        navigate('/start');
        break;
      case 1: // Builder
        navigate('/builder');
        break;
      case 2: // Refine
        navigate('/refine');
        break;
      case 3: // Export - already on this page
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tab: 'resumes' | 'ai-writer' | 'editor') => {
    switch (tab) {
      case 'resumes':
        // Navigate to editor (user has one resume)
        navigate('/refine');
        break;
      case 'ai-writer':
        navigate('/builder');
        break;
      case 'editor':
        navigate('/refine');
        break;
    }
  };

  const handleUnauthenticatedDownload = () => {
    setShowRegistration(true);
  };

  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const handleExportPDF = () => {
    // Always show paywall for PDF
    setIsPaywallOpen(true);
  };

  const buildTxtFromDisplayData = (data: any): string => {
    const lines: string[] = [];
    const fullName = [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ');
    if (fullName) lines.push(fullName);
    if (data.location) lines.push(data.location);
    if (Array.isArray(data.contacts) && data.contacts.length) {
      lines.push('Contacts:');
      data.contacts.forEach((c: string) => lines.push(`- ${c}`));
    }
    if (data.professional_summary) {
      lines.push('');
      lines.push('Professional Summary');
      lines.push(data.professional_summary);
    }
    if (Array.isArray(data.skills) && data.skills.length) {
      lines.push('');
      lines.push('Skills');
      data.skills.forEach((s: string) => lines.push(`- ${s}`));
    }
    if (Array.isArray(data.experience) && data.experience.length) {
      lines.push('');
      lines.push('Experience');
      data.experience.forEach((exp: any) => {
        const header = [exp.job_title, exp.company].filter(Boolean).join(' — ');
        if (header) lines.push(`- ${header}`);
        const dates = [exp.start_date, exp.end_date || 'Present'].filter(Boolean).join(' - ');
        if (dates) lines.push(`  ${dates}`);
        if (Array.isArray(exp.responsibilities)) {
          exp.responsibilities.forEach((r: string) => lines.push(`  • ${r}`));
        }
      });
    }
    if (Array.isArray(data.education) && data.education.length) {
      lines.push('');
      lines.push('Education');
      data.education.forEach((edu: any) => {
        const header = [edu.degree, edu.institution].filter(Boolean).join(' — ');
        if (header) lines.push(`- ${header}`);
        if (edu.graduation_date) lines.push(`  ${edu.graduation_date}`);
      });
    }
    return lines.join('\n');
  };

  const handleExportTXT = async () => {
    if (!resume) return;
    try {
      await refreshResume();
      const displayData = convertApiResumeToDisplayData(resume);
      const txtContent = buildTxtFromDisplayData(displayData);
      const firstName = resume.personal_info?.first_name || '';
      const lastName = resume.personal_info?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const filename = `${(fullName || 'resume').replace(/\s+/g, '_')}.txt`;
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to TXT:', error);
    }
  };

  // Function to get full HTML with CSS styles
  const getFullHTMLWithStyles = (element: HTMLElement): string => {
    // Get all CSS styles from document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Ignore CORS errors for external styles
          return '';
        }
      })
      .filter(style => style.length > 0)
      .join('\n');

    // Create full HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t('export.pageTitle')}</title>
          <style>
            ${styles}
            
            /* Additional styles for PDF */
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            }
            * {
              box-sizing: border-box;
            }
            
            /* Ensure proper box-sizing for PDF export */
            .MuiBox-root {
              box-sizing: border-box;
            }
            
            /* Remove any extra margins/padding that might affect PDF layout */
            body, html {
              margin: 0;
              padding: 0;
            }
            
            /* Force apply styles for PDF */
            @media print {
              body {
                height: 100vh;
                overflow: hidden;
                font-size: 12px;
                line-height: 1.4;
              }
              h1, h2, h3, h4, h5, h6 {
                margin: 0.5em 0;
                line-height: 1.2;
              }
              p, li {
                margin: 0.3em 0;
                line-height: 1.3;
              }
              ul, ol {
                margin: 0.3em 0;
                padding-left: 1.2em;
              }
              .section {
                margin-bottom: 0.5em;
              }
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `;
    
    return fullHtml;
  };

  const handleBackToStart = () => {
    setShowSuccess(false);
  };

  // If loading, show indicator
  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: '#f5f6fa'
      }}>
        <LoadingSpinner />
      </Box>
    );
  }

  // If error, show message
  if (queryError || !resume) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: '#f5f6fa'
      }}>
        <ErrorMessage 
          message={queryError || t('refine.error.notFound')} 
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  // If showing success page, render it
  if (showSuccess) {
    return <SuccessPage onBackToStart={handleBackToStart} />;
  }

  // Convert resume data for display
  const displayData = convertApiResumeToDisplayData(resume);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Common header */}
      <Header 
        activeStep={3} 
        onBack={handleBack}
        showNextButton={false}
        previousButtonText="Refine"
        showLogo={true}
        onStepClick={handleStepClick}
        allowFirstStepClick={true}
        isProUser={user?.is_premium}
        currentTab="editor"
        onTabChange={handleTabChange}
      />
      
      {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 6 },
        gap: { xs: 2, sm: 3, md: 4 }
      }}>
        {/* Header */}
        <Box sx={{ width: '100%', maxWidth: 1100, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            We tested thousands of CV templates — these three perform the best.
          </Typography>
        </Box>

        {/* Template selection cards */}
        <Box sx={{ width: '100%', maxWidth: 1100 }}>
          {displayData && (
            <TemplateSelectionCards
              selectedTemplateId={selectedTemplate?.id}
              onSelect={(tpl) => updateTemplate(tpl)}
              resumeData={displayData}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="outlined"
            onClick={handleExportTXT}
            sx={{
              borderColor: COLORS.grey[600],
              color: COLORS.grey[700],
              textTransform: 'none',
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1, sm: 1.25 }
            }}
          >
            {t('export.buttons.downloadTxtFree', 'Download TXT (Free)')}
          </Button>
          <Button 
            variant="contained"
            onClick={handleExportPDF}
            sx={{
              bgcolor: COLORS.primary.main,
              textTransform: 'none',
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1, sm: 1.25 },
              '&:hover': { bgcolor: COLORS.primary.dark }
            }}
          >
            {t('export.buttons.upgradeToPdf', 'Upgrade to Download PDF')}
          </Button>
        </Box>
      </Box>

      {/* Hidden template for export */}
      <Box sx={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={templateContainerRef} style={{ width: '794px', height: '1123px' }}>
          <ResumeRenderer 
            data={displayData} 
            scale={1}
            templateId={selectedTemplate?.id}
            fitToContainer={false}
            isPreview={false}
          />
        </div>
      </Box>
      <RegistrationModal
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={() => setShowRegistration(false)}
      />
      <PaywallModal 
        open={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSuccess={() => setIsPaywallOpen(false)}
      />
    </Box>
  );
};

export default ExportPage; 