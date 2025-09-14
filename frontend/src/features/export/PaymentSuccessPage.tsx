import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { userApi } from '../../shared/services/api';
import { COLORS } from '../../shared/theme/theme';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateUser, user } = useAuthContext();

  useEffect(() => {
    (async () => {
      try {
        // Refresh user data after payment success
        const res = await userApi.getCurrentUser();
        if (res) {
          updateUser(res);
        }
      } catch (e) {
        // Ignore refresh errors, page still usable
      }
    })();
  }, [updateUser]);

  const handleGoToResumes = () => {
    navigate('/resumes');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f6fa' }}>
      <Header 
        activeStep={3}
        showNextButton={false}
        showBackButton={false}
        showSteps={false}
        isProUser={user?.is_premium}
      />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 3, md: 4 } }}>
        <Card sx={{ width: '100%', maxWidth: 560, borderRadius: { xs: 2, sm: 3 }, boxShadow: { xs: 'none', sm: '0 8px 32px rgba(0, 0, 0, 0.08)' } }}>
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: { xs: 72, sm: 88 }, height: { xs: 72, sm: 88 }, borderRadius: '50%', bgcolor: COLORS.success.main, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 28px rgba(76, 175, 80, 0.35)', mb: 1 }}>
              <CheckCircleIcon sx={{ color: 'white', fontSize: { xs: 44, sm: 56 } }} />
            </Box>

            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#2c3e50', fontSize: { xs: '1.6rem', sm: '2rem' }, textAlign: 'center' }}>
              {t('payment.success.title')}
            </Typography>

            <Typography variant="body1" sx={{ color: '#667085', textAlign: 'center', maxWidth: 460, lineHeight: 1.6 }}>
              {t('payment.success.message')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                onClick={handleGoToResumes}
                sx={{ 
                  textTransform: 'none', 
                  px: 3, 
                  py: 1.25,
                  borderColor: '#d0d5dd',
                  color: '#344054',
                  '&:hover': { borderColor: '#98a2b3', bgcolor: '#f8fafc' }
                }}
              >
                {t('payment.success.goToResumes')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PaymentSuccessPage;
