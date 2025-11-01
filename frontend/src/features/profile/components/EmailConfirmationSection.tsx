import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import {
  Email as EmailIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { userApi } from '../../../shared/services/api';
import { User } from '../../../shared/services/api/types';

interface EmailConfirmationSectionProps {
  user: User;
}

export const EmailConfirmationSection: React.FC<EmailConfirmationSectionProps> = ({
  user
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await userApi.resendEmailConfirmation(user.email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(t('profileSettings.emailConfirmation.error'));
    } finally {
      setLoading(false);
    }
  };

  if (user.is_verified) {
    return null; // Don't show if email is already verified
  }

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 2,
        p: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EmailIcon sx={{ color: '#6b7280', fontSize: 20 }} />
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
          {t('profileSettings.emailConfirmation.title')}
        </Typography>
      </Box>

      <Alert
        severity="warning"
        icon={<WarningIcon />}
        sx={{ mb: 2 }}
      >
        <Typography sx={{ fontWeight: 600, display: 'inline' }}>
          Email not confirmed:{' '}
        </Typography>
        {t('profileSettings.emailConfirmation.warning').replace('Email not confirmed: ', '')}
      </Alert>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('profileSettings.emailConfirmation.success')}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="outlined"
        size="small"
        startIcon={<EmailIcon sx={{ fontSize: 18 }} />}
        onClick={handleResend}
        disabled={loading}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '12px'
        }}
      >
        {t('profileSettings.emailConfirmation.resendButton')}
      </Button>
    </Box>
  );
};

