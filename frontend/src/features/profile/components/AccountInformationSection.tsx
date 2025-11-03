import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, IconButton, InputAdornment } from '@mui/material';
import { Person as PersonIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon } from '@mui/icons-material';
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
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailChangePending, setIsEmailChangePending] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when user prop changes
  React.useEffect(() => {
    setFirstName(user.first_name || '');
    setLastName(user.last_name || '');
    setEmail(user.email || '');
    setIsEmailChangePending(false);
    setVerificationCode('');
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
    setSuccess(false);
    setError(null);

    const emailChanged = email !== user.email && user.email !== null;
    const emailBeingSet = email !== user.email && user.email === null;

    // Case 1: Only name changes
    if (!emailChanged && !emailBeingSet) {
      setLoading(true);
      try {
        const updatedUser = await userApi.updateCurrentUser({
          first_name: firstName,
          last_name: lastName
        });
        onUpdate(updatedUser);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || t('profileSettings.accountInfo.error');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Case 2: Setting email for first time (from null)
    if (emailBeingSet) {
      setLoading(true);
      try {
        const updatedUser = await userApi.updateCurrentUser({
          first_name: firstName,
          last_name: lastName,
          email: email
        });
        onUpdate(updatedUser);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || t('profileSettings.accountInfo.error');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Case 3: Changing existing email
    if (emailChanged) {
      // If code not yet requested, request it
      if (!isEmailChangePending) {
        setIsSendingCode(true);
        try {
          await userApi.requestEmailChangeCode(email);
          setIsEmailChangePending(true);
          setError(null);
        } catch (err: any) {
          const errorMessage = err.response?.data?.detail || err.message || t('profileSettings.accountInfo.error');
          setError(errorMessage);
        } finally {
          setIsSendingCode(false);
        }
        return;
      }

      // Code has been requested, now submit with code
      setLoading(true);
      try {
        const updatedUser = await userApi.updateCurrentUser({
          first_name: firstName,
          last_name: lastName,
          email: email,
          verification_code: verificationCode
        });
        onUpdate(updatedUser);
        setSuccess(true);
        setIsEmailChangePending(false);
        setVerificationCode('');
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || t('profileSettings.accountInfo.error');
        if (errorMessage.includes('Invalid verification code') || errorMessage.includes('Verification code required')) {
          setError(t('profileSettings.accountInfo.invalidCode'));
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyEmail = async () => {
    if (!user.email) return;
    
    setIsSendingCode(true);
    setError(null);
    try {
      await userApi.resendEmailConfirmation(user.email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || t('profileSettings.accountInfo.error');
      setError(errorMessage);
    } finally {
      setIsSendingCode(false);
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {user.email && user.is_verified && (
                    <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  )}
                  {user.email && !user.is_verified && (
                    <IconButton
                      size="small"
                      onClick={handleVerifyEmail}
                      disabled={isSendingCode}
                      sx={{ p: 0.5 }}
                    >
                      <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
          
          {user.email && !user.is_verified && (
            <Button
              size="small"
              onClick={handleVerifyEmail}
              disabled={isSendingCode}
              sx={{
                alignSelf: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '11px'
              }}
            >
              {isSendingCode ? t('profileSettings.accountInfo.sendingCode') : t('profileSettings.accountInfo.verifyEmailButton')}
            </Button>
          )}

          {isEmailChangePending && (
            <>
              <Alert severity="info" sx={{ fontSize: '12px' }}>
                {t('profileSettings.accountInfo.checkEmailMessage')}
              </Alert>
              <TextField
                label={t('profileSettings.accountInfo.verificationCodeLabel')}
                placeholder={t('profileSettings.accountInfo.verificationCodePlaceholder')}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                required
                inputProps={{ maxLength: 6 }}
                sx={inputStyles}
              />
            </>
          )}

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
            disabled={loading || isSendingCode || (isEmailChangePending && !verificationCode)}
            sx={{
              alignSelf: 'flex-start',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              mt: 0.5
            }}
          >
            {loading ? t('common.saving') : 
             isSendingCode ? t('profileSettings.accountInfo.sendingCode') :
             isEmailChangePending ? t('profileSettings.accountInfo.saveChanges') :
             (email !== user.email && user.email !== null) ? t('profileSettings.accountInfo.sendingCode').replace('...', '') :
             t('profileSettings.accountInfo.saveChanges')}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

