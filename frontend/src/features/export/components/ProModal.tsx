import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import Radio from '@mui/material/Radio';
import { exportApi } from '../exportApi';

interface ProModalProps {
  open: boolean;
  onClose: () => void;
}

const ProModal: React.FC<ProModalProps> = ({ open, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');

  const features = [
    'Full access to AI Resume Builder',
    'Unlimited resume uploads',
    'ATS Optimization included',
    'AI-powered editing suggestions',
    'Clean PDF export without watermark'
  ];

  const handleContinue = async () => {
    try {
      let planId: 'pro' | 'lifetime';
      if (selectedPlan === 'monthly') {
        planId = 'pro';
      } else {
        planId = 'lifetime';
      }
      await exportApi.downloadResume(planId);
      console.log(`Successfully processed ${selectedPlan} plan`);
      onClose();
    } catch (error) {
      console.error(`Failed to process ${selectedPlan} plan:`, error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="pro-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Box sx={{
        width: 500,
        maxWidth: '90vw',
        bgcolor: '#1a1a1a',
        borderRadius: '12px',
        p: 4,
        position: 'relative',
        outline: 'none'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white',
              fontWeight: 700
            }}
          >
            Unlock Your Resume's Full Potential
          </Typography>
        </Box>

        {/* Features */}
        <Box sx={{ mb: 4 }}>
          {features.map((feature, index) => (
            <Box 
              key={feature}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 2
              }}
            >
              <CheckIcon sx={{ 
                color: '#4caf50', 
                fontSize: 20,
                mr: 2
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
                  flex: 1
                }}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Pricing Options */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{
                border: selectedPlan === 'monthly' ? '2px solid #1976d2' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                p: 2,
                bgcolor: selectedPlan === 'monthly' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Radio 
                    value="monthly" 
                    checked={selectedPlan === 'monthly'}
                    onChange={(e) => setSelectedPlan(e.target.value as 'monthly' | 'lifetime')}
                    sx={{ color: '#1976d2' }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', ml: 1 }}>
                    <Typography sx={{ color: 'white', fontWeight: 600 }}>
                      Monthly
                    </Typography>
                    <Typography sx={{ color: 'white', fontWeight: 700 }}>
                      29,00 $/month
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{
                border: selectedPlan === 'lifetime' ? '2px solid #1976d2' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                p: 2,
                bgcolor: selectedPlan === 'lifetime' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Radio 
                    value="lifetime" 
                    checked={selectedPlan === 'lifetime'}
                    onChange={(e) => setSelectedPlan(e.target.value as 'monthly' | 'lifetime')}
                    sx={{ color: '#1976d2' }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', ml: 1 }}>
                    <Typography sx={{ color: 'white', fontWeight: 600 }}>
                      Lifetime
                    </Typography>
                    <Typography sx={{ color: 'white', fontWeight: 700 }}>
                      149,00 $/once
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

        {/* Continue Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleContinue}
          sx={{
            bgcolor: '#1976d2',
            color: 'white',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': {
              bgcolor: '#1565c0'
            }
          }}
        >
          CONTINUE
        </Button>
      </Box>
    </Modal>
  );
};

export default ProModal; 