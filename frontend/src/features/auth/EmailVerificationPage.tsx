import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from '@mui/material';
import AuthLayout from './components/AuthLayout';
import VerificationCodeInput from '../../shared/components/VerificationCodeInput';
import { authApi } from '../../shared/services/api/authApi';
import { useAuthContext } from '../../shared/contexts/AuthContext';

const EmailVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthContext();
  
  const email = searchParams.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmitCode = async (code: string) => {
    if (!email) {
      setError(t('auth.verification.invalidCode'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.confirmEmailByCode({
        email,
        code
      });

      // Store tokens and login user
      login(response);
      setSuccess(t('auth.emailConfirmation.success.title'));
      
      // Redirect after short delay
      setTimeout(() => {
        const resumeId = searchParams.get('resume_id');
        if (resumeId) {
          navigate(`/refine?resume_id=${resumeId}&redirect=/refine?resume_id=${resumeId}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 1500);

    } catch (error: any) {
      console.error('Email verification failed:', error);
      setError(error?.response?.data?.detail || t('auth.verification.invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    try {
      await authApi.resendVerificationCode({
        email,
        code_type: 'email_confirm'
      });
      setError(null);
    } catch (error) {
      console.error('Failed to resend verification code:', error);
      setError(t('auth.verification.invalidCode'));
    }
  };

  const handleBack = () => {
    navigate('/auth/signup', { replace: true });
  };

  if (!email) {
    return (
      <AuthLayout title={t('auth.verification.title')}>
        <Alert severity="error">
          Email parameter is missing. Please try signing up again.
        </Alert>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title={t('auth.verification.title')}>
        <Alert severity="success">
          {success}
        </Alert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.verification.title')}>
      <VerificationCodeInput
        onSubmit={handleSubmitCode}
        onResendCode={handleResendCode}
        onBack={handleBack}
        email={email}
        isLoading={isLoading}
        error={error}
        title={t('auth.verification.title')}
        subtitle={t('auth.verification.subtitle', { email })}
      />
    </AuthLayout>
  );
};

export default EmailVerificationPage;
