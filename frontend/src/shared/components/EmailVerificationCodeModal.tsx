import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import React from 'react';
import { useTranslation } from 'react-i18next';
import VerificationCodeInput from './VerificationCodeInput';

interface EmailVerificationCodeModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onSubmitCode: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  shouldStartTimer?: boolean;
}

const EmailVerificationCodeModal: React.FC<EmailVerificationCodeModalProps> = ({
  open,
  email,
  onClose,
  onSubmitCode,
  onResendCode,
  isLoading = false,
  error = null,
  shouldStartTimer = false,
}) => {
  const { t } = useTranslation();
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: 560,
          maxWidth: '95vw',
          bgcolor: 'white',
          borderRadius: '20px',
          p: { xs: 2.5, sm: 4 },
          position: 'relative',
          outline: 'none',
          boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <VerificationCodeInput
          onSubmit={onSubmitCode}
          onResendCode={onResendCode}
          onBack={onClose}
          email={email}
          isLoading={isLoading}
          error={error}
          shouldStartTimer={shouldStartTimer}
          title={t('auth.existingAccountCode.title')}
          subtitle={t('auth.existingAccountCode.subtitle', { email: maskedEmail })}
        />
      </Box>
    </Modal>
  );
};

export default EmailVerificationCodeModal;
