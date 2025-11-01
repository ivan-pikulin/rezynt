import React, { useState } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import {
  Star as StarIcon,
  TrendingUp as UpgradeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { User } from '../../../shared/services/api/types';
import { COLORS } from '../../../shared/theme/theme';
import PaywallModal from '../../../shared/components/PaywallModal';

interface SubscriptionSectionProps {
  user: User;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  user
}) => {
  const { t } = useTranslation();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const handleUpgrade = () => {
    setIsPaywallOpen(true);
  };

  if (user.is_premium) {
    // Premium users - show elegant premium chip
    return (
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '2px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
          You are Premium.
        </Typography>
        
        <Chip
          icon={<StarIcon />}
          label="Premium"
          variant="filled"
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '11px',
            height: '22px',
            background: `linear-gradient(135deg, ${COLORS.credits.star} 0%, #ffb74d 100%)`,
            color: 'white',
            boxShadow: '0 2px 8px rgba(255, 200, 87, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '& .MuiChip-icon': {
              color: 'white',
              fontSize: '14px'
            }
          }}
        />
      </Box>
    );
  }

  // Free users - simple message with upgrade button
  return (
    <>
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '2px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
          Looks like your plan's asking for a promotion.
        </Typography>

        <Button
          variant="outlined"
          size="small"
          startIcon={<UpgradeIcon sx={{ fontSize: 16 }} />}
          onClick={handleUpgrade}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '12px',
            py: 0.5,
            px: 1.5,
            flexShrink: 0
          }}
        >
          {t('profileSettings.subscription.upgradeButton')}
        </Button>
      </Box>

      <PaywallModal
        open={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSuccess={() => setIsPaywallOpen(false)}
      />
    </>
  );
};

