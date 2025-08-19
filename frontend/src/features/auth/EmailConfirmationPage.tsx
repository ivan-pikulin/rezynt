import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthLayout from './components/AuthLayout';
import EmailConfirmation from './components/EmailConfirmation';
import { EmailConfirmationParams } from './types/auth';

const EmailConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [confirmationData, setConfirmationData] = useState<EmailConfirmationParams | null>(null);

  useEffect(() => {
    // Определяем статус из URL пути
    const pathname = window.location.pathname;
    let status: 'success' | 'error' = 'success';
    
    if (pathname.includes('error')) {
      status = 'error';
    }
    
    const message = searchParams.get('message');
    const error = searchParams.get('error');

    setConfirmationData({
      status,
      message: message || undefined,
      error: error || undefined
    });
  }, [searchParams]);

  if (!confirmationData) {
    return (
      <AuthLayout title="Подтверждение email">
        <div>Загрузка...</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Подтверждение email">
      <EmailConfirmation 
        status={confirmationData.status}
        message={confirmationData.message}
        error={confirmationData.error}
      />
    </AuthLayout>
  );
};

export default EmailConfirmationPage;
