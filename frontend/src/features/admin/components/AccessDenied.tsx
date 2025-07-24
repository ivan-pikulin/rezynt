import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CommonDialog from 'shared/components/ui/CommonDialog';
import ParticlesBackground from 'features/auth/components/ParticlesBackground';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      width: '100%'
    }}>
      <ParticlesBackground />
      <CommonDialog
        open={true}
        onClose={() => {}}
        showCloseButton={false}
        maxWidth="xs"
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {t('admin.access_denied')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            fullWidth
          >
            {t('common.go_back')}
          </Button>
        </Box>
      </CommonDialog>
    </Box>
  );
}; 