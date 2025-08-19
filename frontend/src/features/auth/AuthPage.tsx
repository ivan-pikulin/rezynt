import Alert from '@mui/material/Alert';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import { AuthMode } from './types/auth';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Определяем начальный режим из URL параметров
  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode;
    if (urlMode === 'login' || urlMode === 'signup') {
      setMode(urlMode);
    }
  }, [searchParams]);

  const handleLoginSuccess = () => {
    navigate('/start');
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

  const getTitle = () => {
    return mode === 'login' ? 'Вход в систему' : 'Регистрация';
  };

  return (
    <AuthLayout title={getTitle()}>
      {showSuccessMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Регистрация успешна! Проверьте ваш email для подтверждения аккаунта.
        </Alert>
      )}
      
      {mode === 'login' ? (
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={handleSwitchToSignup}
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
