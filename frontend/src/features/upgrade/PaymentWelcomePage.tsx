import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { useUser } from '../../shared/hooks';
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

  useEffect(() => {
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      yandexMetrikaService.trackPaymentSuccess({ is_premium: user?.is_premium ?? false });
    }

    (async () => {
      try {
        const response = await refetchUser();
        if (response.data) {
          updateUser(response.data);
        }
      } catch (error) {
        // The page remains usable with the user already stored after payment activation.
      }
    })();
  }, [refetchUser, updateUser, user?.is_premium]);

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
            bgcolor: COLORS.success.light,
            color: COLORS.success.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: { xs: 48, sm: 58 } }} />
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
          {t('payment.welcome.message')}
        </Typography>

        <Button
          variant="contained"
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
          }}
        >
          {t('payment.welcome.continue')}
        </Button>
      </Container>
    </Box>
  );
};

export default PaymentWelcomePage;
