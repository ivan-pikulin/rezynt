import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { usePolling, useUser } from '../../shared/hooks';
import { User } from '../../shared/services/api/types';
import { yandexMetrikaService } from '../../shared/services/yandexMetrikaService';
import { COLORS } from '../../shared/theme/theme';
import { landingConceptVars } from '../landing-concept/LandingConceptTheme';
import '../landing-concept/LandingConceptPage.css';

export const PaymentWelcomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthContext();
  const { refetch: refetchUser } = useUser();
  const hasTrackedRef = useRef(false);
  const { data: polledUser } = usePolling<User>({
    fetchFn: async () => {
      const response = await refetchUser();
      if (!response.data) {
        throw new Error('User data unavailable');
      }
      return response.data;
    },
    shouldStop: (data) => data.is_premium,
    interval: 2500,
  });

  useEffect(() => {
    if (polledUser) {
      updateUser(polledUser);
    }
  }, [polledUser, updateUser]);

  const isPremium = user?.is_premium ?? polledUser?.is_premium ?? false;

  useEffect(() => {
    if (!hasTrackedRef.current && isPremium) {
      hasTrackedRef.current = true;
      yandexMetrikaService.trackPaymentSuccess({ is_premium: true });
    }
  }, [isPremium]);

  return (
    <Box
      className="lc-page"
      style={landingConceptVars}
      sx={{
        minHeight: '100vh',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header className="lc-header">
        <div className="lc-shell lc-header__inner">
          <div className="lc-header__start">
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

      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: { xs: 2, sm: 3 },
          py: { xs: 5, md: 7 },
        }}
      >
        <Box
          sx={{
            width: { xs: 78, sm: 92 },
            height: { xs: 78, sm: 92 },
            borderRadius: '50%',
            bgcolor: isPremium ? COLORS.success.light : COLORS.button.primary.backgroundDisabled,
            color: isPremium ? COLORS.success.main : COLORS.button.primary.textDisabled,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          {isPremium ? (
            <CheckCircleRoundedIcon sx={{ fontSize: { xs: 48, sm: 58 } }} />
          ) : (
            <CircularProgress size={34} color="inherit" />
          )}
        </Box>

        <Typography
          component="h1"
          sx={{
            color: COLORS.landing.text,
            fontSize: { xs: '2rem', md: '2.65rem' },
            lineHeight: 1.1,
            fontWeight: 850,
            mb: 1.5,
          }}
        >
          {t('payment.welcome.title')}
        </Typography>

        <Typography
          sx={{
            color: COLORS.landing.mutedText,
            fontSize: { xs: '1rem', md: '1.08rem' },
            lineHeight: 1.55,
            maxWidth: 480,
            mb: 4,
          }}
        >
          {isPremium ? t('payment.welcome.message') : t('payment.welcome.waiting')}
        </Typography>

        <Button
          variant="contained"
          disabled={!isPremium}
          onClick={() => navigate('/export')}
          sx={{
            minWidth: { xs: '100%', sm: 220 },
            minHeight: 56,
            bgcolor: COLORS.primary.main,
            color: COLORS.button.primary.text,
            textTransform: 'none',
            borderRadius: 2,
            fontSize: '1.08rem',
            fontWeight: 800,
            boxShadow: COLORS.landing.shadowButton,
            '&:hover': {
              bgcolor: COLORS.primary.dark,
              boxShadow: COLORS.landing.shadowButtonHover,
            },
            '&:disabled': {
              bgcolor: COLORS.button.primary.backgroundDisabled,
              color: COLORS.button.primary.textDisabled,
              boxShadow: 'none',
            },
          }}
        >
          {isPremium ? t('payment.welcome.continue') : t('payment.welcome.processing')}
        </Button>
      </Container>
    </Box>
  );
};

export default PaymentWelcomePage;
