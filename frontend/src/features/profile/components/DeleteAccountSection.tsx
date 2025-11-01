import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../../shared/services/api';
import { useAuthContext } from '../../../shared/contexts/AuthContext';

export const DeleteAccountSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleDeleteClick = () => {
    if (!password) {
      setError(t('profileSettings.deleteAccount.error'));
      return;
    }
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await userApi.deleteAccount(password);
      setDialogOpen(false);
      // Logout and redirect
      logout();
      navigate('/');
    } catch (err) {
      setError(t('profileSettings.deleteAccount.error'));
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DeleteIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
            {t('profileSettings.deleteAccount.title')}
          </Typography>
        </Box>

        <Alert
          severity="error"
          icon={<WarningIcon />}
          sx={{ mb: 2, fontSize: '12px' }}
        >
          <Typography sx={{ fontWeight: 600, display: 'inline' }}>
            Warning:{' '}
          </Typography>
          {t('profileSettings.deleteAccount.warning').replace('Warning: ', '')}
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label={t('profileSettings.deleteAccount.confirmPassword')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
            required
            sx={inputStyles}
          />

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
            onClick={handleDeleteClick}
            disabled={loading || !password}
            sx={{
              alignSelf: 'flex-start',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              mt: 0.5
            }}
          >
            {t('profileSettings.deleteAccount.deleteButton')}
          </Button>
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('profileSettings.deleteAccount.modalTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('profileSettings.deleteAccount.modalText')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            sx={{ textTransform: 'none' }}
          >
            {t('profileSettings.deleteAccount.modalCancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {t('profileSettings.deleteAccount.modalConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

