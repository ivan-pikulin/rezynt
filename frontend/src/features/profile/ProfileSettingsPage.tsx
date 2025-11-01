import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { userApi } from '../../shared/services/api';
import { User } from '../../shared/services/api/types';
import { AccountInformationSection } from './components/AccountInformationSection';
import { EmailConfirmationSection } from './components/EmailConfirmationSection';
import { SubscriptionSection } from './components/SubscriptionSection';
import { PasswordSecuritySection } from './components/PasswordSecuritySection';
import { DeleteAccountSection } from './components/DeleteAccountSection';
import Header from '../../shared/components/Header/Header';

const ProfileSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: contextUser, updateUser } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contextUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userData = await userApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [contextUser, navigate]);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    updateUser(updatedUser);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <Header
        showSteps={false}
        showBackButton={false}
        showNextButton={false}
      />

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton
            onClick={() => navigate('/refine')}
            sx={{
              color: '#2c3e50',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            {t('profileSettings.title')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SubscriptionSection user={user} />

          <AccountInformationSection
            user={user}
            onUpdate={handleUserUpdate}
          />

          <EmailConfirmationSection user={user} />

          <PasswordSecuritySection />

          <DeleteAccountSection />
        </Box>
      </Container>
    </Box>
  );
};

export default ProfileSettingsPage;

