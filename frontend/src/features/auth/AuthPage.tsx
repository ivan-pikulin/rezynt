import Alert from '@mui/material/Alert';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import { AuthMode } from './types/auth';
import { useAuthContext } from '../../shared/contexts/AuthContext';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { isAuthenticated } = useAuthContext();

  // Determine initial mode from URL parameters
  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode;
    if (urlMode === 'login' || urlMode === 'signup') {
      setMode(urlMode);
    }
  }, [searchParams]);

  const handleLoginSuccess = () => {
    // Redirect to the page user came from, or to /
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const handleSignupSuccess = () => {
    setShowSuccessMessage(true);
    setMode('login');
  };

  const handleSwitchToSignup = () => {
    setMode('signup');
    setShowSuccessMessage(false);
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    setShowSuccessMessage(false);
  };

  const handleSwitchToPasswordReset = () => {
    navigate('/auth/request-password-reset');
  };

  const getTitle = () => {
    return mode === 'login' ? t('auth.page.loginTitle') : t('auth.page.signupTitle');
  };

  return (
    <AuthLayout title={getTitle()}>
      {showSuccessMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('auth.page.signupSuccessMessage')}
        </Alert>
      )}
      
      {mode === 'login' ? (
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={handleSwitchToSignup}
          onSwitchToPasswordReset={handleSwitchToPasswordReset}
        />
      ) : (
        <SignupForm 
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </AuthLayout>
  );
};

export default AuthPage;
