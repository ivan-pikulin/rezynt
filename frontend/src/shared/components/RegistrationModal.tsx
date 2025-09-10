import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import LoginForm from '../../features/auth/components/LoginForm';
import SignupForm from '../../features/auth/components/SignupForm';
import EmailConfirmationModal from './EmailConfirmationModal';

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSignupSuccess?: (email?: string) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ open, onClose, onSuccess, onSignupSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleSignupSuccess = (email?: string) => {
    setRegisteredEmail(email || '');
    setShowEmailConfirmation(true);
  };

  const handleEmailConfirmationClose = () => {
    setShowEmailConfirmation(false);
    setRegisteredEmail('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => !isProcessing && onClose()}
      aria-labelledby="registration-modal-title"
      disableEscapeKeyDown={isProcessing}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Box sx={{
        width: 520,
        maxWidth: '95vw',
        maxHeight: '95vh',
        bgcolor: 'white',
        borderRadius: '12px',
        p: 2.5,
        position: 'relative',
        outline: 'none',
        overflow: 'auto',
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
        <Typography id="registration-modal-title" variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Save your resume in the cloud, chat with AI, and export without limits.
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          aria-label="registration-tabs"
          sx={{ mb: 2 }}
        >
          <Tab label="Sign up" value="signup" />
          <Tab label="Log in" value="login" />
        </Tabs>

        <Divider sx={{ mb: 2 }} />

        {activeTab === 'signup' ? (
          <SignupForm
            onSuccess={onSignupSuccess || handleSignupSuccess}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        ) : (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setActiveTab('signup')}
            onSwitchToPasswordReset={() => setActiveTab('login')}
          />
        )}

      </Box>
    </Modal>
  );
};

// Separate component for email confirmation
const RegistrationModalWithEmailConfirmation: React.FC<RegistrationModalProps> = (props) => {
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleSignupSuccess = (email?: string) => {
    setRegisteredEmail(email || '');
    setShowEmailConfirmation(true);
  };

  const handleEmailConfirmationClose = () => {
    setShowEmailConfirmation(false);
    setRegisteredEmail('');
    props.onClose();
  };

  return (
    <>
      <RegistrationModal
        {...props}
        onSignupSuccess={handleSignupSuccess}
      />
      <EmailConfirmationModal
        open={showEmailConfirmation}
        onClose={handleEmailConfirmationClose}
        email={registeredEmail}
      />
    </>
  );
};


export default RegistrationModalWithEmailConfirmation;


