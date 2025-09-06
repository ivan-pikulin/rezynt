import Alert from '@mui/material/Alert';
import React, { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const signupSuccess = useMemo(() => searchParams.get('signup_success') === '1', [searchParams]);

  const handleLoginSuccess = () => {
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const handleSwitchToSignup = () => {
    navigate('/signup');
  };

  const handleSwitchToPasswordReset = () => {
    navigate('/auth/request-password-reset');
  };

  return (
    <AuthLayout title={t('auth.page.loginTitle')}>
      {signupSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('auth.page.signupSuccessMessage')}
        </Alert>
      )}

      <LoginForm 
        onSuccess={handleLoginSuccess}
        onSwitchToSignup={handleSwitchToSignup}
        onSwitchToPasswordReset={handleSwitchToPasswordReset}
      />
    </AuthLayout>
  );
};

export default LoginPage;


