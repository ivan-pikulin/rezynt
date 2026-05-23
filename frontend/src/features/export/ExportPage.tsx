import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { useTemplate } from '../../shared/hooks/useTemplate';
import { COLORS } from '../../shared/theme/theme';
import ErrorMessage from '../refine/components/ErrorMessage';
import LoadingSpinner from '../refine/components/LoadingSpinner';
import { convertApiResumeToDisplayData } from '../refine/utils/resumeDataConverter';
import TemplateSelectionCards from './components/TemplateSelectionCards';
import { landingConceptVars } from '../landing-concept/LandingConceptTheme';
import '../landing-concept/LandingConceptPage.css';

const ExportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // No more resume_id in URL - each user has one resume
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const isGuestResume = !authLoading && !isAuthenticated;
  const { resume, isLoading: loading, error: queryError } = useResumeQuery(isGuestResume);
  const { selectedTemplate, updateTemplate } = useTemplate(null, undefined);

  // Authentication check removed - guest users can access this page

  const handleDownloadClick = () => {
    navigate('/upgrade');
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
              onSelect={(tpl) => updateTemplate(tpl)}
              resumeData={displayData}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
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
        </Box>
      </Box>
    </Box>
  );
};

export default ExportPage;
