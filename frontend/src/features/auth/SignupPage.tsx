import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from './components/AuthLayout';
import SignupForm from './components/SignupForm';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get temp_file_id from URL parameters
  const tempFileId = searchParams.get('temp_file_id');

  const handleSignupSuccess = (email?: string) => {
    if (email) {
      // Redirect to email verification page with email parameter
      const params = new URLSearchParams({ email });
      if (tempFileId) {
        params.set('resume_id', tempFileId);
      }
      navigate(`/auth/verify-email?${params.toString()}`);
    } else {
      navigate('/login?signup_success=1');
    }
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <AuthLayout title={t('auth.page.signupTitle')}>
      <SignupForm 
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={handleSwitchToLogin}
        tempFileId={tempFileId}
      />
    </AuthLayout>
  );
};

export default SignupPage;


