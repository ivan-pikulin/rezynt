import React from 'react';
import { Box, Typography } from '@mui/material';
import { AdminUsers } from '../components/AdminUsers';
import { LinkRequests } from '../components/LinkRequests';
import { useTranslation } from 'react-i18next';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
            {t('admin.link_requests')}
          </Typography>
          <LinkRequests />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
            {t('admin.users_management')}
          </Typography>
          <AdminUsers />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPage; 