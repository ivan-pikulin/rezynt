import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import RegistrationModal from '../../shared/components/RegistrationModal';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import GradientSpinnerAnimation from '../../shared/components/GradientSpinnerAnimation';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { useAuth } from '../../shared/hooks/useAuth';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { useTemplate } from '../../shared/hooks/useTemplate';
import { COLORS } from '../../shared/theme/theme';
import ErrorMessage from '../refine/components/ErrorMessage';
import LoadingSpinner from '../refine/components/LoadingSpinner';
import { convertApiResumeToDisplayData } from '../refine/utils/resumeDataConverter';
import SuccessPage from './components/SuccessPage';
import TemplateSelectionCards from './components/TemplateSelectionCards';
import { exportApi } from './exportApi';

const ExportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const templateContainerRef = useRef<HTMLDivElement>(null);
  
  // No more resume_id in URL - each user has one resume
  const { resume, isLoading: loading, error: queryError, refreshResume } = useResumeQuery(false);
  const { selectedTemplate, updateTemplate } = useTemplate(null, undefined);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user, isAuthenticated } = useAuthContext();
  const { user: authUser, isAuthenticated: authAuthenticated, isLoading: authLoading } = useAuth();

  // Authentication check removed - guest users can access this page

  const handleBack = () => {
    navigate('/refine');
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Create
        navigate('/start');
        break;
      case 1: // Analyze
        navigate('/refine');
        break;
      case 2: // Export - already on this page
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tab: 'resumes' | 'ai-writer' | 'editor' | 'build' | 'analyze' | 'export') => {
    switch (tab) {
      case 'build':
        navigate('/build');
        break;
      case 'analyze':
        navigate('/refine');
        break;
      case 'export':
        // Already on export page
        break;
      case 'resumes':
      case 'ai-writer':
      case 'editor':
        // Legacy tabs - ignore or redirect
        break;
    }
  };

  const handleUnauthenticatedDownload = () => {
    setShowRegistration(true);
  };

  const handleExportPDF = async () => {
    // For premium users - perform real download
    if (user?.is_premium) {
      await handleRealPDFDownload();
    } else {
      // For non-premium users - navigate to upgrade page
      navigate('/upgrade');
    }
  };

  const handleRealPDFDownload = async () => {
    if (!resume || !templateContainerRef.current) return;
    
    setIsDownloading(true);
    try {
      // Get the HTML content from the template container
      const element = templateContainerRef.current.querySelector('div > div');
      if (!element) {
        console.error('Template element not found');
        setIsDownloading(false);
        return;
      }

      // Get full HTML with styles
      const fullHtml = getFullHTMLWithStyles(element as HTMLElement);
      
      // Prepare filename
      const firstName = resume.personal_info?.first_name || '';
      const lastName = resume.personal_info?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const filename = `${(fullName || 'resume').replace(/\s+/g, '_')}.pdf`;
      
      // Call API to export PDF
      const pdfBlob = await exportApi.exportToPDF({
        html_content: fullHtml,
        filename: filename,
        template_slug: selectedTemplate?.id || 'clarity'
      });
      
      // Download the PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportTXT = async () => {
    if (!resume) return;
    try {
      setIsDownloading(true);
      // Call API to export TXT
      const txtBlob = await exportApi.exportToTXT();
      
      // Get filename from Content-Disposition header or use default
      const firstName = resume.personal_info?.first_name || '';
      const lastName = resume.personal_info?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const filename = `${(fullName || 'resume').replace(/\s+/g, '_')}.txt`;
      
      // Download the TXT file
      const url = window.URL.createObjectURL(txtBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to TXT:', error);
    } finally {
      setIsDownloading(false);
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
        activeStep={2} 
        onBack={handleBack}
        showNextButton={false}
        previousButtonText="Analyze"
        showLogo={true}
        onStepClick={handleStepClick}
        allowFirstStepClick={true}
        isProUser={user?.is_premium}
        currentTab="export"
        onTabChange={handleTabChange}
        hideNavigationArrows={true}
        customSteps={[t('header.steps.start'), t('header.steps.refine'), t('header.steps.export')]}
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
        <Box sx={{ width: '100%', maxWidth: 1200, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            We tested thousands of CV templates — these four perform the best.
          </Typography>
        </Box>

        {/* Template selection cards */}
        <Box sx={{ width: '100%', maxWidth: 1200 }}>
          {displayData && (
            <TemplateSelectionCards
              selectedTemplateId={selectedTemplate?.id}
              onSelect={(tpl) => updateTemplate(tpl)}
              resumeData={displayData}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {user?.is_premium ? (
            // Premium user - show download PDF button
            <Button 
              variant="contained"
              onClick={handleExportPDF}
              disabled={isDownloading}
              sx={{
                bgcolor: COLORS.primary.main,
                textTransform: 'none',
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1, sm: 1.25 },
                '&:hover': { bgcolor: COLORS.primary.dark },
                minWidth: 150
              }}
            >
              {isDownloading ? (
                <GradientSpinnerAnimation size={20} thickness={3} />
              ) : (
                t('export.buttons.downloadPdf', 'Download PDF')
              )}
            </Button>
          ) : (
            // Non-premium user - show TXT download and upgrade button
            <>
              <Button 
                variant="outlined"
                onClick={handleExportTXT}
                disabled={isDownloading}
                sx={{
                  borderColor: COLORS.grey[600],
                  color: COLORS.grey[700],
                  textTransform: 'none',
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 1, sm: 1.25 }
                }}
              >
                {isDownloading ? (
                  <GradientSpinnerAnimation size={20} thickness={3} />
                ) : (
                  t('export.buttons.downloadTxtFree', 'Download TXT (Free)')
                )}
              </Button>
              <Button 
                variant="contained"
                onClick={handleExportPDF}
                sx={{
                  bgcolor: COLORS.primary.main,
                  textTransform: 'none',
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 1, sm: 1.25 },
                  '&:hover': { bgcolor: COLORS.primary.dark },
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(103, 58, 183, 0.4)'
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 20px 5px rgba(103, 58, 183, 0.2)'
                    }
                  }
                }}
              >
                {t('export.buttons.upgradeToPdf', 'Upgrade to Download PDF')}
              </Button>
            </>
          )}
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
    </Box>
  );
};

export default ExportPage; 