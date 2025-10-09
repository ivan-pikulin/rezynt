import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Modal from '@mui/material/Modal';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../contexts/AuthContext';
import { useUser } from '../hooks';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const { refetch: refetchUser } = useUser();
  const { updateUser } = useAuthContext();

  const features = [
    t('paywall.features.unlimitedAI'),
    t('paywall.features.unlimitedResumes'),
    t('paywall.features.premiumTemplates'),
    t('paywall.features.cleanPDF')
  ];

  const handleContinue = async () => {
    setIsProcessing(true);
    try {
      window.location.assign('https://buy.stripe.com/7sY28t1jrf0n1mt3g743S0K');
      return;
    } catch (error) {
      console.error(`Failed to process ${selectedPlan} plan:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="paywall-modal-title"
      disableEscapeKeyDown={isProcessing}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Box sx={{
        width: 450,
        maxWidth: '90vw',
        maxHeight: '90vh',
        bgcolor: '#1a1a1a',
        borderRadius: '12px',
        p: 2.5,
        position: 'relative',
        outline: 'none',
        overflow: 'auto'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white',
              fontWeight: 700
            }}
          >
            {t('paywall.title')}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'white',
              opacity: 0.8
            }}
          >
            {t('paywall.currency')}
          </Typography>
        </Box>

        {/* Subtitle */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white',
            mb: 2.5,
            fontSize: '0.9rem'
          }}
        >
          {t('paywall.subtitle')}
        </Typography>

        {/* Features */}
        <Box sx={{ mb: 2.5 }}>
          {features.map((feature, index) => (
            <Box 
              key={feature}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 1
              }}
            >
              <CheckIcon sx={{ 
                color: '#4caf50', 
                fontSize: 16,
                mr: 1
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
                  flex: 1,
                  fontSize: '0.8rem'
                }}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Pricing Options */}
        <FormControl component="fieldset" sx={{ width: '100%', mb: 2.5 }}>
          <RadioGroup value={selectedPlan}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{
                border: '2px solid #673ab7',
                borderRadius: '8px',
                p: 1.5,
                bgcolor: 'rgba(103, 58, 183, 0.1)'
              }}>
                <FormControlLabel
                  value="yearly"
                  control={<Radio sx={{ color: '#673ab7' }} checked />}
                  label={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>
                        {t('paywall.plans.yearly.label')}
                      </Typography>
                      <Typography sx={{ color: 'white', fontWeight: 700, ml: 1 }}>
                        {t('paywall.plans.yearly.price')}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Box>
            </Box>
          </RadioGroup>
        </FormControl>

        {/* Continue Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleContinue}
          disabled={isProcessing}
          sx={{
            bgcolor: '#673ab7',
            color: 'white',
            py: 1.25,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            mb: 2,
            '&:hover': {
              bgcolor: '#5e35b1'
            },
            '&:disabled': {
              bgcolor: 'rgba(103, 58, 183, 0.5)',
              color: 'rgba(255, 255, 255, 0.5)'
            }
          }}
        >
          {isProcessing ? t('paywall.buttons.processing') : t('paywall.buttons.continue')}
        </Button>


      </Box>
    </Modal>
  );
};

export default PaywallModal;
