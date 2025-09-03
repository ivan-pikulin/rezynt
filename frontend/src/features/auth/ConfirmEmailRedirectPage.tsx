import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ConfirmEmailRedirectPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/auth/email-confirmation-error?error=missing_token', { replace: true });
      return;
    }

    // Redirect to backend to perform confirmation and 302 back to frontend success/error page
    const apiUrl = import.meta.env.VITE_API_URL;
    const url = `${apiUrl}/auth/confirm-email?token=${encodeURIComponent(token)}`;
    window.location.replace(url);
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>{t('common.loading')}</div>
  );
};

export default ConfirmEmailRedirectPage;


