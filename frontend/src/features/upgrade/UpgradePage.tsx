import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { COLORS } from '../../shared/theme/theme';
import { landingConceptVars } from '../landing-concept/LandingConceptTheme';
import '../landing-concept/LandingConceptPage.css';

const planIds = ['best'] as const;

type UpgradePlanId = (typeof planIds)[number];

type UpgradePlan = {
  id: UpgradePlanId;
  formats: string[];
  featureCount: number;
};

const plans: UpgradePlan[] = [
  {
    id: 'best',
    formats: ['pdf', 'word'],
    featureCount: 4,
  },
];

export const UpgradePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPlanId, setSelectedPlanId] = useState<UpgradePlanId | null>(null);

  const handleUpgrade = (planId: UpgradePlanId) => {
    setSelectedPlanId(planId);
  };

  const landingHeader = (
    <header className="lc-header">
      <div className="lc-shell lc-header__inner">
        <div className="lc-header__start">
          <Link to="/export" className="lc-header-back" aria-label={t('upgrade.backToTemplates')}>
            <ArrowBackRoundedIcon aria-hidden="true" />
            <span className="lc-header-back__label">{t('upgrade.backToTemplates')}</span>
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
      {landingHeader}

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 4, sm: 5, md: 7 },
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 760, mx: 'auto', mb: { xs: 3, md: 4.5 } }}>
          <Typography
            component="h1"
            sx={{
              color: COLORS.landing.text,
              fontSize: { xs: '1.75rem', md: '2.35rem' },
              lineHeight: 1.1,
              fontWeight: 850,
              mb: 1.25,
            }}
          >
            {t('upgrade.title')}
          </Typography>
          <Typography
            sx={{
              color: COLORS.landing.mutedText,
              fontSize: { xs: '0.98rem', md: '1.08rem' },
              lineHeight: 1.55,
            }}
          >
            {t('upgrade.subtitle')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: { xs: 2.5, md: 4 },
            alignItems: 'stretch',
            width: '100%',
            maxWidth: 620,
            mx: 'auto',
          }}
        >
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;

            return (
              <Box
                key={plan.id}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: { xs: 'auto', md: 620 },
                  display: 'flex',
                  flexDirection: 'column',
                  p: { xs: 3, sm: 4, md: 5 },
                  pt: { xs: 3, sm: 4, md: 6 },
                  borderRadius: 3,
                  border: `1px solid ${COLORS.landing.border}`,
                  bgcolor: COLORS.landing.surfaceStrong,
                  boxShadow: COLORS.landing.shadow,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, minHeight: 34, mb: { xs: 2, md: 3 } }}>
                  {plan.formats.map((format) => (
                    <Box
                      key={format}
                      sx={{
                        minWidth: format === 'word' ? 88 : 62,
                        height: 34,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 1.5,
                        borderRadius: 999,
                        border: `1px solid ${format === 'pdf' ? COLORS.error.main : COLORS.primary.main}`,
                        color: format === 'pdf' ? COLORS.error.main : COLORS.primary.main,
                        fontSize: '0.96rem',
                        fontWeight: 650,
                        lineHeight: 1,
                      }}
                    >
                      {format}
                    </Box>
                  ))}
                </Box>

                <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
                  <Typography
                    sx={{
                      color: COLORS.primary.main,
                      fontSize: { xs: '3.35rem', md: '4.3rem' },
                      lineHeight: 1,
                      fontWeight: 900,
                      mb: 1.25,
                    }}
                  >
                    {t(`upgrade.plans.${plan.id}.price`)}
                  </Typography>
                  <Typography
                    sx={{
                      color: COLORS.landing.mutedText,
                      fontSize: { xs: '1rem', md: '1.08rem' },
                      lineHeight: 1.35,
                      fontWeight: 650,
                    }}
                  >
                    {t(`upgrade.plans.${plan.id}.priceNote`)}
                  </Typography>
                </Box>

                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1.45, md: 1.7 },
                    flex: 1,
                  }}
                >
                  {Array.from({ length: plan.featureCount }, (_, index) => (
                    <Box
                      key={index}
                      component="li"
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '26px 1fr',
                        gap: 1.4,
                        alignItems: 'start',
                      }}
                    >
                      <CheckIcon
                        sx={{
                          mt: 0.15,
                          color: COLORS.primary.main,
                          fontSize: 22,
                          strokeWidth: 2,
                        }}
                      />
                      <Typography
                        sx={{
                          color: COLORS.landing.text,
                          fontSize: { xs: '1.02rem', md: '1.18rem' },
                          lineHeight: 1.48,
                          fontWeight: 650,
                        }}
                      >
                        {t(`upgrade.plans.${plan.id}.features.${index}`)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleUpgrade(plan.id)}
                  sx={{
                    mt: { xs: 3.5, md: 4.5 },
                    minHeight: { xs: 58, md: 68 },
                    bgcolor: COLORS.primary.main,
                    color: COLORS.button.primary.text,
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: { xs: '1.16rem', md: '1.35rem' },
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
                  {isSelected ? t('upgrade.buttons.selected') : t('upgrade.buttons.pay')}
                </Button>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default UpgradePage;
