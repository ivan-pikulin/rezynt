import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { userApi } from '../../../shared/services/api';
import { User } from '../../../shared/services/api/types';

interface AccountInformationSectionProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const AccountInformationSection: React.FC<AccountInformationSectionProps> = ({
  user,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when user prop changes
  React.useEffect(() => {
    setFirstName(user.first_name || '');
    setLastName(user.last_name || '');
    setEmail(user.email || '');
  }, [user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const updatedUser = await userApi.updateCurrentUser({
        first_name: firstName,
        last_name: lastName,
        email: email
      });
      onUpdate(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('profileSettings.accountInfo.error'));
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
        <PersonIcon sx={{ color: '#6b7280', fontSize: 20 }} />
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
          {t('profileSettings.accountInfo.title')}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              label={t('profileSettings.accountInfo.firstName')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              sx={inputStyles}
            />

            <TextField
              label={t('profileSettings.accountInfo.lastName')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              sx={inputStyles}
            />
          </Box>

          <TextField
            label={t('profileSettings.accountInfo.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
            type="email"
            required
            sx={inputStyles}
          />

          {success && (
            <Alert severity="success">
              {t('profileSettings.accountInfo.success')}
            </Alert>
          )}

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={loading}
            sx={{
              alignSelf: 'flex-start',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              mt: 0.5
            }}
          >
            {t('profileSettings.accountInfo.saveChanges')}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

