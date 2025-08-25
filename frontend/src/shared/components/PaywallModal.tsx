import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import { exportApi } from '../../features/export/exportApi';
import { useUser } from '../hooks';
import { useAuthContext } from '../contexts/AuthContext';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ open, onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'lifetime'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const { refetch: refetchUser } = useUser();
  const { updateUser } = useAuthContext();

  const features = [
    'Unlimited AI Writer Use',
    'Unlimited Resumes',
    'Premium Templates',
    'Clean PDF Download'
  ];

  const handleContinue = async () => {
    setIsProcessing(true);
    try {
      let planId: 'pro' | 'lifetime';
      if (selectedPlan === 'monthly' || selectedPlan === 'quarterly') {
        planId = 'pro';
      } else {
        planId = 'lifetime';
      }
      await exportApi.downloadResume(planId);
      console.log(`Successfully processed ${selectedPlan} plan`);
      
      // Обновляем данные пользователя после успешной оплаты
      try {
        const updatedUser = await refetchUser();
        if (updatedUser.data) {
          updateUser(updatedUser.data);
        }
      } catch (error) {
        console.error('Failed to update user data:', error);
      }
      
      onSuccess?.();
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
            Upgrade to Pro
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'white',
              opacity: 0.8
            }}
          >
            $ (USD)
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
          Create unlimited resumes and unlock all features
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
          <RadioGroup
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value as 'monthly' | 'quarterly' | 'lifetime')}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{
                border: selectedPlan === 'monthly' ? '2px solid #673ab7' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                p: 1.5,
                bgcolor: selectedPlan === 'monthly' ? 'rgba(103, 58, 183, 0.1)' : 'transparent'
              }}>
                <FormControlLabel
                  value="monthly"
                  control={<Radio sx={{ color: '#673ab7' }} />}
                  label={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>
                        Monthly
                      </Typography>
                      <Typography sx={{ color: 'white', fontWeight: 700 }}>
                        29,00 $/mo
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Box>

              <Box sx={{
                border: selectedPlan === 'quarterly' ? '2px solid #673ab7' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                p: 1.5,
                bgcolor: selectedPlan === 'quarterly' ? 'rgba(103, 58, 183, 0.1)' : 'transparent',
                position: 'relative'
              }}>
                <Chip
                  label="SAVE 34%"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: 16,
                    bgcolor: '#4caf50',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
                <FormControlLabel
                  value="quarterly"
                  control={<Radio sx={{ color: '#673ab7' }} />}
                  label={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>
                        Quarterly
                      </Typography>
                      <Typography sx={{ color: 'white', fontWeight: 700 }}>
                        19,00 $/mo
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Box>

              <Box sx={{
                border: selectedPlan === 'lifetime' ? '2px solid #673ab7' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                p: 1.5,
                bgcolor: selectedPlan === 'lifetime' ? 'rgba(103, 58, 183, 0.1)' : 'transparent'
              }}>
                <FormControlLabel
                  value="lifetime"
                  control={<Radio sx={{ color: '#673ab7' }} />}
                  label={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>
                        Lifetime
                      </Typography>
                      <Typography sx={{ color: 'white', fontWeight: 700 }}>
                        149,00 $/once
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
          {isProcessing ? 'PROCESSING...' : 'CONTINUE'}
        </Button>


      </Box>
    </Modal>
  );
};

export default PaywallModal;
