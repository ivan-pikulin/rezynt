import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, TextField, Button, Box, Typography } from '@mui/material';
import AuthLayout from './components/AuthLayout';
import VerificationCodeInput from '../../shared/components/VerificationCodeInput';
import { authApi } from '../../shared/services/api/authApi';

const PasswordResetVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [verifiedCode, setVerifiedCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [shouldStartTimer, setShouldStartTimer] = useState(false);

  // Get initial verification token when component mounts
  useEffect(() => {
    const getInitialToken = async () => {
      if (!email) return;
      
      try {
        const response = await authApi.resendVerificationCode({
          email,
          code_type: 'password_reset'
        });
        
        if (response.token) {
          setVerificationToken(response.token);
          setShouldStartTimer(true); // Start timer after initial token fetch
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

    // Just store the code and move to password step
    // We'll verify it when submitting the new password
    setVerifiedCode(code);
    setStep('password');
    setError(null);
  };

  const handleSubmitPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError(t('auth.signup.passwordRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.signup.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('auth.signup.passwordTooShort'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!verificationToken) {
        setError('Verification token not available. Please try resending the code.');
        return;
      }

      await authApi.resetPasswordByCode({
        email,
        code: verifiedCode,
        token: verificationToken,
        new_password: newPassword
      });

      setSuccess(t('auth.login.passwordResetSuccess'));
      
      // Redirect to login after short delay
      setTimeout(() => {
        navigate('/auth/login', { replace: true });
      }, 2000);

    } catch (error: any) {
      console.error('Password reset failed:', error);
      setError(error?.response?.data?.detail || t('auth.verification.invalidCode'));
      
      // If code is invalid, go back to code step
      if (error?.response?.status === 400) {
        setStep('code');
        setVerifiedCode('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    try {
      const response = await authApi.resendVerificationCode({
        email,
        code_type: 'password_reset'
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
    if (step === 'password') {
      setStep('code');
      setVerifiedCode('');
      setError(null);
    } else {
      navigate('/auth/request-password-reset', { replace: true });
    }
  };

  if (!email) {
    return (
      <AuthLayout title={t('auth.verification.title')}>
        <Alert severity="error">
          Email parameter is missing. Please try requesting password reset again.
        </Alert>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title={t('auth.passwordReset.title')}>
        <Alert severity="success">
          {success}
        </Alert>
      </AuthLayout>
    );
  }

  if (step === 'code') {
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
          shouldStartTimer={shouldStartTimer}
          title={t('auth.verification.title')}
          subtitle={t('auth.verification.subtitle', { email })}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.passwordReset.newPasswordTitle')}>
      <Box sx={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('auth.passwordReset.newPasswordTitle')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('auth.passwordReset.newPasswordSubtitle')}
        </Typography>

        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label={t('auth.passwordReset.newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
          />
          
          <TextField
            fullWidth
            label={t('auth.passwordReset.confirmNewPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmitPassword}
            disabled={isLoading || !newPassword || !confirmPassword}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? t('common.loading') : t('auth.passwordReset.submit')}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={handleBack}
            disabled={isLoading}
          >
            {t('common.back')}
          </Button>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default PasswordResetVerificationPage;
