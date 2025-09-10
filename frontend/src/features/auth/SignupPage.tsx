import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from './components/AuthLayout';
import SignupForm from './components/SignupForm';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignupSuccess = (email?: string) => {
    navigate('/login?signup_success=1');
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <AuthLayout title={t('auth.page.signupTitle')}>
      <SignupForm 
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </AuthLayout>
  );
};

export default SignupPage;


