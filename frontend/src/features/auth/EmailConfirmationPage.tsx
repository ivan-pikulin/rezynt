import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import AuthLayout from './components/AuthLayout';
import EmailConfirmation from './components/EmailConfirmation';
import { EmailConfirmationParams } from './types/auth';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import GradientSpinnerAnimation from '../../shared/components/GradientSpinnerAnimation';

const EmailConfirmationPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [confirmationData, setConfirmationData] = useState<EmailConfirmationParams | null>(null);

  useEffect(() => {
    // Determine status from URL path
    const pathname = window.location.pathname;
    let status: 'success' | 'error' = 'success';
    if (pathname.includes('error')) {
      status = 'error';
    }

    const message = searchParams.get('message');
    const error = searchParams.get('error');

    // Try to auto-login if tokens present in query
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const tokenType = searchParams.get('token_type') || 'bearer';

    setConfirmationData({
      status,
      message: message || undefined,
      error: error || undefined
    });

    // If success and tokens provided, store tokens and redirect
    if (status === 'success' && accessToken && refreshToken) {
      login({ access_token: accessToken, refresh_token: refreshToken, token_type: tokenType });
      
      // Check if there's a redirect parameter (legacy resume_id removed)
      const resumeId = searchParams.get('resume_id');
      if (resumeId) {
        // Redirect to RefinePage (user has one resume now)
        navigate('/refine?redirect=/refine', { replace: true });
      } else {
        // Replace to avoid keeping tokens in history
        navigate('/', { replace: true });
      }
    }
  }, [searchParams, login, navigate]);

  if (!confirmationData) {
    return (
      <AuthLayout title={t('auth.emailConfirmation.title')}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <GradientSpinnerAnimation size={40} />
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.emailConfirmation.title')}>
      <EmailConfirmation 
        status={confirmationData.status}
        message={confirmationData.message}
        error={confirmationData.error}
      />
    </AuthLayout>
  );
};

export default EmailConfirmationPage;
