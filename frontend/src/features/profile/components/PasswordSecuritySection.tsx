import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import {
  Lock as LockIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { userApi } from '../../../shared/services/api';

export const PasswordSecuritySection: React.FC = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      backgroundColor: '#F9FAFB',
      '& fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#e5e7eb',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '12px',
      padding: '8px 12px',
    },
    '& .MuiInputLabel-root': {
      fontSize: '12px',
    },
  };

  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (!passwordsMatch) {
      setError(t('profileSettings.passwordSecurity.mismatch'));
      return;
    }

    setLoading(true);

    try {
      await userApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('profileSettings.passwordSecurity.error'));
    } finally {
      setLoading(false);
    }
  };

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
        <LockIcon sx={{ color: '#6b7280', fontSize: 20 }} />
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
          {t('profileSettings.passwordSecurity.title')}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label={t('profileSettings.passwordSecurity.currentPassword')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
            required
            sx={inputStyles}
          />

          <TextField
            label={t('profileSettings.passwordSecurity.newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
            required
            sx={inputStyles}
          />

          <TextField
            label={t('profileSettings.passwordSecurity.confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
            required
            error={confirmPassword.length > 0 && !passwordsMatch}
            helperText={
              confirmPassword.length > 0 && !passwordsMatch
                ? t('profileSettings.passwordSecurity.mismatch')
                : ''
            }
            sx={inputStyles}
          />

          {success && (
            <Alert severity="success">
              {t('profileSettings.passwordSecurity.success')}
            </Alert>
          )}

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="small"
            startIcon={<LockIcon sx={{ fontSize: 18 }} />}
            disabled={loading || !passwordsMatch || !currentPassword || !newPassword}
            sx={{
              alignSelf: 'flex-start',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              mt: 0.5
            }}
          >
            {t('profileSettings.passwordSecurity.updateButton')}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

