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
import DownloadOptions from './components/DownloadOptions';
import SuccessPage from './components/SuccessPage';
import UnauthenticatedExportView from './components/UnauthenticatedExportView';
import { exportApi } from './exportApi';
import RegistrationModal from '../../shared/components/RegistrationModal';

const ExportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');
  const templateContainerRef = useRef<HTMLDivElement>(null);
  const { resume, isLoading: loading, error: queryError, refreshResume } = useResumeQuery(resumeId);
  const { selectedTemplate } = useTemplate(resumeId, resume?.template_slug);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const { user, isAuthenticated } = useAuthContext();
  const { user: authUser, isAuthenticated: authAuthenticated, isLoading: authLoading } = useAuth();

  // Check if resume belongs to user
  useEffect(() => {
    if (authLoading || loading) return; // Wait for authentication and resume loading
    
    if (resume) {
      const isGuestResume = !resumeId || resumeId === 'guest' || resume.id === -1;
      
      // If this is not a guest resume and user is not authenticated
      if (!isGuestResume && !authAuthenticated) {
        navigate('/login');
        return;
      }
      
      // If user is authenticated and this is not their resume
      if (authAuthenticated && authUser && !isGuestResume && resume.user_id !== authUser.id) {
        navigate('/login');
        return;
      }
    }
  }, [resume, authUser, authAuthenticated, authLoading, loading, resumeId, navigate]);

  const handleBack = () => {
    navigate(`/refine?resume_id=${resumeId}`);
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start - disabled for unauthenticated users
        // Do nothing - step is not clickable
        break;
      case 1: // Generate
        navigate(`/chat?resume_id=${resumeId}`);
        break;
      case 2: // Refine
        navigate(`/refine?resume_id=${resumeId}`);
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
        navigate('/resumes');
        break;
      case 'ai-writer':
        navigate(`/chat?resume_id=${resumeId}`);
        break;
      case 'editor':
        navigate(`/refine?resume_id=${resumeId}`);
        break;
    }
  };

  const handleUnauthenticatedDownload = () => {
    setShowRegistration(true);
  };

  const handleExportPDF = async () => {
    if (!user) {
      setShowRegistration(true);
      return;
    }
    if (!templateContainerRef.current || !resume) return;
    
    try {
      // Request fresh data before export
      await refreshResume();
      
      // Get full HTML with CSS styles
      const fullHtml = getFullHTMLWithStyles(templateContainerRef.current);
      
      // Log the final HTML for debugging
      console.log('Final HTML for export:', fullHtml);
      
      // Use real data for filename
      const displayData = convertApiResumeToDisplayData(resume);
      const fullName = `${displayData.first_name || ''} ${displayData.last_name || ''}`.trim();
      const filename = `${fullName.replace(/\s+/g, '_')}_resume.pdf`;
      
      // Send request to backend for PDF generation
      const pdfBlob = await exportApi.exportToPDF(resumeId!, {
        html_content: fullHtml,
        filename: filename,
        template_slug: selectedTemplate?.id
      });
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success page after successful download
      setShowSuccess(true);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
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

  // If no resumeId, show error
  if (!resumeId) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: '#f5f6fa'
      }}>
        <ErrorMessage 
          message={t('refine.error.noResumeId')} 
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

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
        showLogo={true} // Show logo on desktop
        onStepClick={handleStepClick}
        allowFirstStepClick={false} // Disable step navigation for all users
        isProUser={user?.is_premium}
        currentTab="editor"
        onTabChange={handleTabChange}
      />
      
      {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        py: { xs: 3, sm: 4, md: 6 } // Additional vertical padding
      }}>
        {!isAuthenticated ? (
          <UnauthenticatedExportView
            resume={resume}
            selectedTemplateId={selectedTemplate?.id}
            onDownloadClick={handleUnauthenticatedDownload}
          />
        ) : (
          <DownloadOptions 
            onExportPDF={handleExportPDF} 
            isPremium={user?.is_premium || false}
          />
        )}
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