import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { useTemplate } from '../../shared/hooks/useTemplate';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { resumeApi } from '../../shared/services/api';
import { yandexMetrikaService } from '../../shared/services/yandexMetrikaService';
import { COLORS } from '../../shared/theme/theme';
import { TemplateConfig } from '../../shared/types/resume';
import ErrorMessage from '../refine/components/ErrorMessage';
import LoadingSpinner from '../refine/components/LoadingSpinner';
import { convertApiResumeToDisplayData } from '../refine/utils/resumeDataConverter';
import TemplateSelectionCards from './components/TemplateSelectionCards';
import { landingConceptVars } from '../landing-concept/LandingConceptTheme';
import '../landing-concept/LandingConceptPage.css';

const ExportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const exportContentRef = useRef<HTMLDivElement>(null);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [isDocxDownloading, setIsDocxDownloading] = useState(false);
  
  // No more resume_id in URL - each user has one resume
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const isGuestResume = !authLoading && !isAuthenticated;
  const { resume, isLoading: loading, error: queryError } = useResumeQuery(isGuestResume);
  const { selectedTemplate, updateTemplate } = useTemplate(null, undefined);
  const isPremium = Boolean(user?.is_premium);

  // Authentication check removed - guest users can access this page

  const handleDownloadClick = () => {
    yandexMetrikaService.trackExportDownloadClick({
      template_id: selectedTemplate?.id,
      is_authenticated: isAuthenticated,
      is_premium: user?.is_premium ?? false,
      format: 'pdf',
    });
    navigate('/upgrade');
  };

  const handleTemplateSelect = (template: TemplateConfig) => {
    updateTemplate(template);
    yandexMetrikaService.trackTemplateSelected(template.id);
  };

  const getResumeFilename = (extension: 'pdf' | 'docx') => {
    const personalInfo = resume?.personal_info;
    const fullName = [personalInfo?.first_name, personalInfo?.last_name].filter(Boolean).join('_');
    return `${fullName || 'resume'}_${selectedTemplate?.id || 'clarity'}.${extension}`;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportStyleProperties = [
    'appearance',
    'background-attachment',
    'background-color',
    'background-image',
    'background-position',
    'background-repeat',
    'background-size',
    'border-bottom-color',
    'border-bottom-left-radius',
    'border-bottom-right-radius',
    'border-bottom-style',
    'border-bottom-width',
    'border-left-color',
    'border-left-style',
    'border-left-width',
    'border-right-color',
    'border-right-style',
    'border-right-width',
    'border-top-color',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-top-style',
    'border-top-width',
    'box-shadow',
    'box-sizing',
    'color',
    'column-gap',
    'display',
    'flex-basis',
    'flex-direction',
    'flex-grow',
    'flex-shrink',
    'flex-wrap',
    'font-family',
    'font-size',
    'font-style',
    'font-weight',
    'gap',
    'grid-template-columns',
    'height',
    'justify-content',
    'left',
    'letter-spacing',
    'line-height',
    'list-style-type',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'margin-top',
    'margin',
    'max-height',
    'max-width',
    'min-height',
    'min-width',
    'opacity',
    'overflow',
    'overflow-wrap',
    'padding-bottom',
    'padding-left',
    'padding-right',
    'padding-top',
    'padding',
    'position',
    'right',
    'text-align',
    'text-decoration',
    'text-overflow',
    'text-transform',
    'top',
    'transform',
    'transform-origin',
    'white-space',
    'width',
    'word-break',
    'z-index',
  ];

  const inlineComputedStyles = (sourceRoot: HTMLElement, targetRoot: HTMLElement) => {
    const sourceElements = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll<HTMLElement>('*'))];
    const targetElements = [targetRoot, ...Array.from(targetRoot.querySelectorAll<HTMLElement>('*'))];

    sourceElements.forEach((sourceElement, index) => {
      const targetElement = targetElements[index];
      if (!targetElement) {
        return;
      }

      const computed = window.getComputedStyle(sourceElement);
      const inlineStyle = exportStyleProperties
        .map((property) => `${property}: ${computed.getPropertyValue(property)};`)
        .join(' ');

      targetElement.setAttribute('style', inlineStyle);
    });
  };

  const getPdfHtml = () => {
    if (!exportContentRef.current) {
      throw new Error('Export content is not ready');
    }

    const clonedContent = exportContentRef.current.cloneNode(true) as HTMLElement;
    inlineComputedStyles(exportContentRef.current, clonedContent);

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
html, body { margin: 0; padding: 0; width: 794px; min-height: 1123px; background: ${COLORS.landing.background}; }
body { box-sizing: border-box; overflow: hidden; }
</style>
</head>
<body>${clonedContent.outerHTML}</body>
</html>`;
  };

  const handlePdfDownload = async () => {
    try {
      setIsPdfDownloading(true);
      yandexMetrikaService.trackExportDownloadClick({
        template_id: selectedTemplate?.id,
        is_authenticated: isAuthenticated,
        is_premium: true,
        format: 'pdf',
      });
      const blob = await resumeApi.exportResumePDF({
        html_content: getPdfHtml(),
        filename: getResumeFilename('pdf'),
        template_slug: selectedTemplate?.id || 'clarity',
      });
      downloadBlob(blob, getResumeFilename('pdf'));
      yandexMetrikaService.trackResumeExportSuccess('pdf', { variant: 'clean' });
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleDocxDownload = async () => {
    try {
      setIsDocxDownloading(true);
      yandexMetrikaService.trackExportDownloadClick({
        template_id: selectedTemplate?.id,
        is_authenticated: isAuthenticated,
        is_premium: true,
        format: 'docx',
      });
      const blob = await resumeApi.exportResumeDOCX({
        filename: getResumeFilename('docx'),
        template_slug: selectedTemplate?.id || 'clarity',
      });
      downloadBlob(blob, getResumeFilename('docx'));
      yandexMetrikaService.trackResumeExportSuccess('docx', { variant: 'clean' });
    } catch (error) {
      console.error('Failed to download DOCX:', error);
    } finally {
      setIsDocxDownloading(false);
    }
  };

  const landingHeader = (
    <header className="lc-header">
      <div className="lc-shell lc-header__inner">
        <div className="lc-header__start">
          <Link to="/#builder" className="lc-header-back" aria-label={t('export.backToEdit')}>
            <ArrowBackRoundedIcon aria-hidden="true" />
            <span className="lc-header-back__label">{t('export.backToEdit')}</span>
          </Link>

          <Link to="/" className="lc-brand" aria-label="Резинт">
            <img
              src="/rezynt-logo-with-name.svg"
              alt="Резинт"
              className="lc-brand__image"
              width="206"
              height="52"
            />
          </Link>
        </div>

      </div>
    </header>
  );

  // If loading, show indicator
  if (authLoading || loading) {
    return (
      <Box className="lc-page" style={landingConceptVars} sx={{ minHeight: '100vh', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
        {landingHeader}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </Box>
      </Box>
    );
  }

  // If error, show message
  if (queryError || !resume) {
    return (
      <Box className="lc-page" style={landingConceptVars} sx={{ minHeight: '100vh', overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
        {landingHeader}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorMessage
            message={queryError || t('refine.error.notFound')}
            onRetry={() => window.location.reload()}
          />
        </Box>
      </Box>
    );
  }

  // Convert resume data for display
  const displayData = convertApiResumeToDisplayData(resume);

  return (
    <Box className="lc-page" style={landingConceptVars} sx={{
      minHeight: '100vh',
      overflow: 'visible',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {landingHeader}

      {/* Main area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        p: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 6 },
        gap: { xs: 2, sm: 3, md: 4 }
      }}>
        {/* Header */}
        <Box sx={{ width: '100%', maxWidth: 1200, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            {t('export.templateSelection.title')}
          </Typography>
        </Box>

        {/* Template selection cards */}
        <Box sx={{ width: '100%', maxWidth: 1200 }}>
          {displayData && (
            <TemplateSelectionCards
              selectedTemplateId={selectedTemplate?.id}
              onSelect={handleTemplateSelect}
              resumeData={displayData}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {isPremium ? (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                onClick={handlePdfDownload}
                disabled={isPdfDownloading}
                startIcon={isPdfDownloading ? <CircularProgress size={18} color="inherit" /> : <DownloadRoundedIcon />}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { sm: 190 },
                  bgcolor: COLORS.primary.main,
                  textTransform: 'none',
                  px: { xs: 4, sm: 5 },
                  py: { xs: 1.35, sm: 1.45 },
                  borderRadius: 2,
                  fontSize: { xs: '1rem', sm: '1.05rem' },
                  fontWeight: 800,
                  boxShadow: COLORS.landing.shadowButton,
                  '&:hover': {
                    bgcolor: COLORS.primary.dark,
                    boxShadow: COLORS.landing.shadowButtonHover,
                  },
                }}
              >
                {isPdfDownloading ? t('export.buttons.downloadingPdf') : t('export.buttons.downloadPdf')}
              </Button>

              <Button
                variant="outlined"
                onClick={handleDocxDownload}
                disabled={isDocxDownloading}
                startIcon={isDocxDownloading ? <CircularProgress size={18} color="inherit" /> : <DescriptionRoundedIcon />}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { sm: 190 },
                  borderColor: COLORS.primary.main,
                  color: COLORS.primary.main,
                  textTransform: 'none',
                  px: { xs: 4, sm: 5 },
                  py: { xs: 1.35, sm: 1.45 },
                  borderRadius: 2,
                  fontSize: { xs: '1rem', sm: '1.05rem' },
                  fontWeight: 800,
                  '&:hover': {
                    borderColor: COLORS.primary.dark,
                    color: COLORS.primary.dark,
                    bgcolor: COLORS.primary.light,
                  },
                }}
              >
                {isDocxDownloading ? t('export.buttons.downloadingDocx') : t('export.buttons.downloadDocx')}
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={handleDownloadClick}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                maxWidth: 420,
                bgcolor: COLORS.primary.main,
                textTransform: 'none',
                px: { xs: 4, sm: 6 },
                py: { xs: 1.35, sm: 1.45 },
                borderRadius: 2,
                fontSize: { xs: '1rem', sm: '1.05rem' },
                fontWeight: 800,
                boxShadow: COLORS.landing.shadowButton,
                '&:hover': {
                  bgcolor: COLORS.primary.dark,
                  boxShadow: COLORS.landing.shadowButtonHover,
                },
              }}
            >
              {t('export.buttons.download')}
            </Button>
          )}
        </Box>
      </Box>

      {displayData && (
        <Box
          sx={{
            position: 'fixed',
            left: -10000,
            top: 0,
            width: 794,
            height: 1123,
            opacity: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <Box ref={exportContentRef} sx={{ width: 794, height: 1123, bgcolor: COLORS.landing.background }}>
            <ResumeRenderer
              data={displayData}
              templateId={selectedTemplate?.id || 'clarity'}
              isPreview={false}
              fitToContainer={false}
              scale={1}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ExportPage;
