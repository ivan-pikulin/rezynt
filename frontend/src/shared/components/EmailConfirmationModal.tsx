import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/theme';

interface EmailConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  email?: string;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({ 
  open, 
  onClose, 
  email 
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="email-confirmation-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Box sx={{
        width: 480,
        maxWidth: '95vw',
        bgcolor: 'white',
        borderRadius: '12px',
        p: 3,
        position: 'relative',
        outline: 'none',
        textAlign: 'center',
        boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
      }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <CheckCircleIcon 
          sx={{ 
            fontSize: 64, 
            color: COLORS.success.main, 
            mb: 2 
          }} 
        />
        
        <Typography 
          id="email-confirmation-modal-title" 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          {t('auth.emailConfirmation.success.title')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {email 
            ? t('auth.emailConfirmation.success.messageWithEmail', { email })
            : t('auth.emailConfirmation.success.message')
          }
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          onClick={onClose}
          sx={{ 
            bgcolor: COLORS.primary.main,
            '&:hover': {
              bgcolor: COLORS.primary.dark
            }
          }}
        >
          {t('auth.emailConfirmation.success.continueButton')}
        </Button>
      </Box>
    </Modal>
  );
};

export default EmailConfirmationModal;
