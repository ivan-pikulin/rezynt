import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { resumeApi } from '../../shared/services/api';
import { Resume } from '../../shared/services/api/types';
import { useTemplate } from '../../shared/hooks/useTemplate';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { useUser } from '../../shared/hooks';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import ResumeEditor from './components/ResumeEditor';
import TemplateSelector from './components/TemplateSelector';
import { convertApiResumeToDisplayData } from './utils/resumeDataConverter';
import { TemplateConfig } from '../../shared/types/resume';
import { COLORS } from '../../shared/theme/theme';
import { exportApi } from '../export/exportApi';
import { useMediaQuery } from '@mui/material';
import PaywallModal from '../../shared/components/PaywallModal';

const RefinePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');
  
  const { resume, isLoading: loading, error: queryError, updateResumeInCache } = useResumeQuery(resumeId);
  const { selectedTemplate, updateTemplate } = useTemplate(resumeId, resume?.template_slug);
  const { user } = useUser();
  const [showPreview, setShowPreview] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeLeftPanel, setActiveLeftPanel] = useState<'editor' | 'templates'>('editor');
  const [hoverTemplate, setHoverTemplate] = useState<TemplateConfig | null>(null);
  const templateContainerRef = useRef<HTMLDivElement>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [pendingPremiumTemplate, setPendingPremiumTemplate] = useState<TemplateConfig | null>(null);
  
  // Define mobile mode for screens up to 768px
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Set title when loading resume
  useEffect(() => {
    if (resume) {
      setTitleValue(resume.title);
    }
  }, [resume]);

  // Resume update handler
  const handleResumeUpdate = (updatedResume: Resume) => {
    updateResumeInCache(updatedResume);
    setTitleValue(updatedResume.title);
  };

  // Template change handler
  const handleTemplateChange = async (template: TemplateConfig) => {
    // First, instantly update local state for preview
    updateTemplate(template);
    
    // Update resume cache for instant display
    if (resume) {
      const updatedResume = { ...resume, template_slug: template.id };
      updateResumeInCache(updatedResume);
    }
    
    // Then asynchronously save to server
    if (resumeId) {
      try {
        await resumeApi.assignTemplateBySlug(parseInt(resumeId), template.id);
      } catch (err) {
        console.error('Error updating template on server:', err);
        // In case of error, we can show user notification
      }
    }
  };
  
  // Handlers for template hover events
  const handleTemplateHover = (template: TemplateConfig) => {
    setHoverTemplate(template);
  };

  const handleTemplateHoverEnd = () => {
    setHoverTemplate(null);
  };

  // Handler for premium template selection
  const handlePremiumTemplateSelect = (template: TemplateConfig) => {
    setPendingPremiumTemplate(template);
    setShowPaywallModal(true);
  };

  // Handler for paywall modal close
  const handlePaywallClose = () => {
    setShowPaywallModal(false);
    setPendingPremiumTemplate(null);
  };

  // Handler for successful upgrade
  const handleUpgradeSuccess = () => {
    setShowPaywallModal(false);
    // If there was a pending premium template, apply it now
    if (pendingPremiumTemplate) {
      handleTemplateChange(pendingPremiumTemplate);
      setPendingPremiumTemplate(null);
    }
  };

  // Title editing handler
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  // Title save handler
  const handleTitleSave = async () => {
    if (!resume || !resumeId) return;
    
    // Close editing immediately
    setIsEditingTitle(false);
    
    try {
      const updatedResume = await resumeApi.updateResumePartial(parseInt(resumeId), { title: titleValue });
      updateResumeInCache(updatedResume);
    } catch (err) {
      // In case of error, return to original value
      setTitleValue(resume.title);
      console.error('Error saving title:', err);
    }
  };
  
  // Title cancel handler
  const handleTitleCancel = () => {
    setTitleValue(resume?.title || '');
    setIsEditingTitle(false);
  };

  const handleNext = () => {
    navigate(`/export?resume_id=${resumeId}`);
  };

  const handleBack = () => {
    navigate(`/chat?resume_id=${resumeId}`);
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start
        navigate('/');
        break;
      case 1: // Generate
        navigate(`/chat?resume_id=${resumeId}`);
        break;
      case 2: // Refine - already on this page
        break;
      case 3: // Export
        navigate(`/export?resume_id=${resumeId}`);
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
        // Already on editor page
        break;
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const toggleLeftPanel = (panel: 'editor' | 'templates') => {
    setActiveLeftPanel(panel);
  };

  const handleDownload = () => {
    if (user?.is_premium) {
      // For pro users, download directly
      handleDirectDownload();
    } else {
      // For regular users, navigate to export page
      navigate(`/export?resume_id=${resumeId}`);
    }
  };

  const handleDirectDownload = async () => {
    if (!templateContainerRef.current || !resume) return;
    
    setIsDownloading(true);
    try {
      // Get full HTML with CSS styles
      const fullHtml = getFullHTMLWithStyles(templateContainerRef.current);
      
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
    } catch (error) {
      console.error('Error downloading resume:', error);
      // Fallback to export page if direct download fails
      navigate(`/export?resume_id=${resumeId}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to get full HTML with CSS styles (copied from ExportPage)
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
          <title>Resume</title>
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

  // If no resumeId, show error
  if (!resumeId) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: COLORS.resume.section.background
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
        bgcolor: COLORS.resume.section.background
      }}>
        <LoadingSpinner message={t('refine.loading')} />
      </Box>
    );
  }

  // If error, show message
  if (queryError || !resume) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: COLORS.resume.section.background
      }}>
        <ErrorMessage 
          message={queryError || t('refine.error.notFound')} 
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  // Convert resume data for display
  const displayData = convertApiResumeToDisplayData(resume);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: COLORS.resume.section.background,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Common header */}
      <Header 
        activeStep={2} 
        onNext={handleNext}
        onBack={handleBack}
        nextButtonText="Export"
        previousButtonText="Generate"
        showLogo={true}
        onStepClick={handleStepClick}
        isProUser={user?.is_premium}
        currentTab="editor"
        onTabChange={handleTabChange}
      />
      
      {/* Main area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 0,
        overflow: 'hidden'
      }}>


        {/* Left panel: editor or templates */}
        <Box sx={{ 
          width: isMobile ? '100%' : '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: COLORS.resume.header.background
        }}>
          {/* Resume header */}
          <Box sx={{ 
            bgcolor: COLORS.resume.header.background,
            borderBottom: `1px solid ${COLORS.resume.section.border}`,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0
          }}>
            {isEditingTitle ? (
              <TextField
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1 }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  } else if (e.key === 'Escape') {
                    handleTitleCancel();
                  }
                }}
                onBlur={handleTitleSave}
              />
            ) : (
              <>
                <IconButton 
                  size="small" 
                  onClick={handleTitleEdit}
                  sx={{ 
                    opacity: 0.6, 
                    p: 0.5,
                    minWidth: 'auto',
                    width: 24,
                    height: 24,
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s'
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
                  {titleValue}
                </Typography>
                
                {/* Toggle buttons for left panel */}
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                  <Tooltip title="Edit Resume Fields">
                    <IconButton 
                      size="small" 
                      onClick={() => toggleLeftPanel('editor')}
                      sx={{ 
                        opacity: activeLeftPanel === 'editor' ? 1 : 0.6, 
                        bgcolor: activeLeftPanel === 'editor' ? COLORS.primary.main : 'transparent',
                        color: activeLeftPanel === 'editor' ? 'white' : 'inherit',
                        '&:hover': { 
                          opacity: 1,
                          bgcolor: activeLeftPanel === 'editor' ? COLORS.primary.dark : 'rgba(0, 0, 0, 0.04)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <PersonIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Choose Template">
                    <IconButton 
                      size="small" 
                      onClick={() => toggleLeftPanel('templates')}
                      sx={{ 
                        opacity: activeLeftPanel === 'templates' ? 1 : 0.6, 
                        bgcolor: activeLeftPanel === 'templates' ? COLORS.primary.main : 'transparent',
                        color: activeLeftPanel === 'templates' ? 'white' : 'inherit',
                        '&:hover': { 
                          opacity: 1,
                          bgcolor: activeLeftPanel === 'templates' ? COLORS.primary.dark : 'rgba(0, 0, 0, 0.04)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <ViewModuleIcon />
                    </IconButton>
                  </Tooltip>
                  {/* Eye button for mobile */}
                  {isMobile && (
                    <Tooltip title="Preview Resume">
                      <IconButton 
                        size="small" 
                        onClick={togglePreview}
                        sx={{ 
                          opacity: showPreview ? 1 : 0.6, 
                          bgcolor: showPreview ? COLORS.primary.main : 'transparent',
                          color: showPreview ? 'white' : 'inherit',
                          '&:hover': { 
                            opacity: 1,
                            bgcolor: showPreview ? COLORS.primary.dark : 'rgba(0, 0, 0, 0.04)'
                          },
                          transition: 'all 0.2s'
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </>
            )}
          </Box>
          


          {/* Content: editor or templates */}
          <Box sx={{ 
            flex: 1,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0
          }}>
            {activeLeftPanel === 'editor' ? (
              <ResumeEditor 
                resume={resume} 
                onResumeUpdate={handleResumeUpdate}
              />
            ) : (
              <Box sx={{ 
                flex: 1,
                p: 2,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: COLORS.grey[100],
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: COLORS.grey[400],
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: COLORS.grey[500],
                  },
                },
              }}>
                <TemplateSelector 
                  onTemplateChange={handleTemplateChange}
                  onTemplateHover={handleTemplateHover}
                  onTemplateHoverEnd={handleTemplateHoverEnd}
                  horizontalLayout={false}
                  selectedTemplate={selectedTemplate}
                  resumeData={displayData}
                  onPremiumTemplateSelect={handlePremiumTemplateSelect}
                  isUserPremium={user?.is_premium}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Vertical separator */}
        <Box sx={{ 
          display: isMobile ? 'none' : 'block',
          width: '1px',
          bgcolor: COLORS.resume.section.border,
          mx: 0
        }} />
        
        {/* Right panel: resume preview */}
        <Box sx={{ 
          width: isMobile ? 0 : '50%',
          height: isMobile ? 0 : 'auto',
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'white'
        }}>
          {/* Resume preview */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'auto',
            p: 2,
            position: 'relative'
          }}>
            <ResumeRenderer 
              data={displayData} 
              scale={0.8} 
              templateId={hoverTemplate?.id || selectedTemplate?.id}
              isPreview={true}
            />
            
            {/* Circular download button in top-right corner */}
            <Tooltip 
              title={isDownloading 
                ? 'Generating PDF...' 
                : (user?.is_premium ? 'Download PDF' : 'Download Resume')
              }
              placement="left"
            >
              <IconButton
                onClick={handleDownload}
                disabled={isDownloading}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  zIndex: 10,
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    transform: 'none'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {isDownloading ? (
                  <CircularProgress size={20} color="primary" />
                ) : (
                  <DownloadIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>


        </Box>
      </Box>

      {/* Sidebar with preview (full screen for mobile) */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'white',
        zIndex: 1000,
        display: isMobile ? (showPreview ? 'flex' : 'none') : 'none',
        flexDirection: 'column',
        transform: isMobile ? (showPreview ? 'translateX(0)' : 'translateX(100%)') : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        overflow: 'hidden'
      }}>
        {/* Sidebar header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${COLORS.chat.input.border}`,
          bgcolor: COLORS.chat.input.background
        }}>
          <Box sx={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.chat.input.text }}>
            {t('refine.preview.title')}
          </Box>
          <IconButton
            onClick={togglePreview}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Sidebar content */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          overflow: 'auto'
        }}>
          {/* Resume preview */}
          <Box sx={{ 
            width: '100%',
            maxWidth: '400px',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start',
            position: 'relative',
            overflow: 'hidden',
            '--resume-scale': '0.6'
          }}>
            <ResumeRenderer 
              data={displayData} 
              scale={0.6} 
              templateId={hoverTemplate?.id || selectedTemplate?.id}
              isPreview={true}
            />
            
            {/* Circular download button for mobile */}
            <Tooltip 
              title={isDownloading 
                ? 'Generating PDF...' 
                : (user?.is_premium ? 'Download PDF' : 'Download Resume')
              }
              placement="left"
            >
              <IconButton
                onClick={handleDownload}
                disabled={isDownloading}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  zIndex: 10,
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    transform: 'none'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {isDownloading ? (
                  <CircularProgress size={16} color="primary" />
                ) : (
                  <DownloadIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Hidden template for PDF export (only for pro users) */}
      {user?.is_premium && (
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
      )}

      {/* PaywallModal for premium templates */}
      <PaywallModal
        open={showPaywallModal}
        onClose={handlePaywallClose}
        onSuccess={handleUpgradeSuccess}
      />
    </Box>
  );
};

export default RefinePage; 