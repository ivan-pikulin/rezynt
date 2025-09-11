import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from './components/AuthLayout';
import SignupForm from './components/SignupForm';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get file_id from URL parameters
  const fileId = searchParams.get('file_id');

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
        tempFileId={fileId}
      />
    </AuthLayout>
  );
};

export default SignupPage;


