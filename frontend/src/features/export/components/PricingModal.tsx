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
import { exportApi } from '../exportApi';

interface PricingModalProps {
  open: boolean;
}

const PricingModal: React.FC<PricingModalProps> = ({ open }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'lifetime'>('monthly');

  const features = [
    'Unlimited AI Writer Use',
    'Unlimited Resumes, Cover Letters, Resignation Letters',
    'Unlimited Keyword Targeting, Content Analysis',
    '1 Free Monthly Resume Review',
    'All other features'
  ];

  const handleContinue = async () => {
    try {
      let planId: 'pro' | 'lifetime';
      if (selectedPlan === 'monthly' || selectedPlan === 'quarterly') {
        planId = 'pro';
      } else {
        planId = 'lifetime';
      }
      await exportApi.downloadResume(planId);
      console.log(`Successfully processed ${selectedPlan} plan`);
    } catch (error) {
      console.error(`Failed to process ${selectedPlan} plan:`, error);
    }
  };

  return (
    <Modal
      open={open}
      aria-labelledby="pricing-modal-title"
      disableEscapeKeyDown
      disableBackdropClick
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
            Nice job with your resume!
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
          variant="body1" 
          sx={{ 
            color: 'white',
            mb: 4,
            fontSize: '1.1rem'
          }}
        >
          Unlock full control, access to all templates, and more
        </Typography>

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
                {feature === '1 Free Monthly Resume Review' && (
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.6)',
                      ml: 1
                    }}
                  >
                    (unavailable on Pro Lifetime)
                  </Typography>
                )}
                {feature === 'All other features' && (
                  <InfoIcon sx={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: 16,
                    ml: 1
                  }} />
                )}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Pricing Options */}
        <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
          <RadioGroup
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value as 'monthly' | 'quarterly' | 'lifetime')}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{
                border: selectedPlan === 'monthly' ? '2px solid #673ab7' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                p: 2,
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
                p: 2,
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
                p: 2,
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
          sx={{
            bgcolor: '#673ab7',
            color: 'white',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            mb: 3,
            '&:hover': {
              bgcolor: '#5e35b1'
            }
          }}
        >
          CONTINUE
        </Button>

        {/* Footer */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}
        >
          Recruiter, educator, or career coach?{' '}
          <Typography 
            component="span" 
            sx={{ 
              color: '#673ab7',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Check out Rezi Enterprise
          </Typography>
        </Typography>
      </Box>
    </Modal>
  );
};

export default PricingModal; 