import React, { useState, useEffect } from 'react';
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
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [shouldStartTimer, setShouldStartTimer] = useState(false);

  // Get initial verification token when component mounts
  useEffect(() => {
    const getInitialToken = async () => {
      if (!email) return;
      
      try {
        const response = await authApi.resendVerificationCode({
          email,
          code_type: 'email_confirm'
        });
        
        if (response.token) {
          console.log('Received verification token:', response.token);
          setVerificationToken(response.token);
          setShouldStartTimer(true); // Start timer after initial token fetch
        } else {
          console.warn('No token received in response:', response);
        }
      } catch (error) {
        console.error('Failed to get initial verification token:', error);
        // Don't show error here as user hasn't tried to submit yet
      }
    };

    getInitialToken();
  }, [email]);

  const handleSubmitCode = async (code: string) => {
    if (!email) {
      setError(t('auth.verification.invalidCode'));
      return;
    }

    if (!verificationToken) {
      setError('Verification token not available. Please try resending the code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting verification code:', { email, code, token: verificationToken });
      const response = await authApi.confirmEmailByCode({
        email,
        code,
        token: verificationToken
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
      const response = await authApi.resendVerificationCode({
        email,
        code_type: 'email_confirm'
      });
      
      if (response.token) {
        setVerificationToken(response.token);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to resend verification code:', error);
      setError(t('auth.verification.invalidCode'));
    }
  };

  const handleBack = () => {
    navigate('/signup', { replace: true });
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
        resendCooldown={30}
        title={t('auth.verification.title')}
        subtitle={t('auth.verification.subtitle', { email })}
        shouldStartTimer={shouldStartTimer}
      />
    </AuthLayout>
  );
};

export default EmailVerificationPage;
