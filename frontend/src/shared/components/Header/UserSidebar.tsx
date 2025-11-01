import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Star as StarIcon
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/AuthContext';
import { resumeApi, userApi } from '../../services/api';
import { User } from '../../services/api/types';
import { COLORS } from '../../theme/theme';

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
}

const UserSidebar: React.FC<UserSidebarProps> = ({ 
  open, 
  onClose, 
  anchor = 'right' 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuthContext();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !userData && user) {
      fetchUserData();
    } else if (!open) {
              // Reset data when closing sidebar
      setUserData(null);
    }
  }, [open, userData, user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await userApi.getCurrentUser();
      setUserData(data);
              updateUser(data); // Update user in context
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavigateToEditor = () => {
    navigate('/refine');
    onClose();
  };

  const handleNavigateToPasswordReset = () => {
    navigate('/auth/request-password-reset');
    onClose();
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
    onClose();
  };

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'G';
  };

  const getPlanName = (isPremium: boolean, isAuthenticated: boolean) => {
    if (!isAuthenticated) return t('header.userSidebar.guest');
    return isPremium ? t('header.userSidebar.premium') : t('header.userSidebar.free');
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          bgcolor: '#fafafa',
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%'
      }}>
        {/* Header with close button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            {t('header.userSidebar.profile')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User information */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 3
        }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: COLORS.primary.main,
              fontSize: '2rem',
              fontWeight: 600,
              mb: 2
            }}
          >
            {getInitials(userData?.email || user?.email || '')}
          </Avatar>
          
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
            {userData?.email || user?.email || t('header.guestUser')}
          </Typography>
          
          <Chip
            icon={(userData?.is_premium ?? user?.is_premium) ? <StarIcon /> : undefined}
            label={getPlanName(userData?.is_premium ?? user?.is_premium ?? false, !!user)}
            variant={(userData?.is_premium ?? user?.is_premium) ? 'filled' : 'outlined'}
            sx={{ 
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(userData?.is_premium ?? user?.is_premium) && {
                background: `linear-gradient(135deg, ${COLORS.credits.star} 0%, #ffb74d 100%)`,
                color: 'white',
                boxShadow: '0 4px 12px rgba(255, 200, 87, 0.4), 0 2px 4px rgba(255, 200, 87, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '& .MuiChip-icon': {
                  color: 'white',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                },
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 8px 20px rgba(255, 200, 87, 0.5), 0 4px 8px rgba(255, 200, 87, 0.3)',
                  background: `linear-gradient(135deg, #ffb74d 0%, ${COLORS.credits.star} 100%)`
                }
              },
              ...!(userData?.is_premium ?? user?.is_premium) && {
                '& .MuiChip-icon': {
                  color: 'inherit'
                },
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }
              }
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Main navigation */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon />}
            onClick={handleNavigateToEditor}
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              py: 2.5,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '16px',
              bgcolor: COLORS.primary.main,
              color: 'white',
              fontSize: '1.1rem',
              position: 'relative',
              animation: 'gentlePulse 3s ease-in-out infinite',
              '@keyframes gentlePulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  boxShadow: `0 4px 12px ${COLORS.primary.main}30`
                },
                '50%': {
                  transform: 'scale(1.02)',
                  boxShadow: `0 6px 20px ${COLORS.primary.main}50`
                }
              },
              '&:hover': {
                animation: 'none',
                bgcolor: COLORS.primary.dark,
                transform: 'scale(1.05)',
                boxShadow: `0 8px 25px ${COLORS.primary.main}60`
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            {t('header.userSidebar.myResume', 'My Resume')}
          </Button>
        </Box>

        {/* Spacer to push buttons down */}
        <Box sx={{ flex: 1 }} />

        {/* Additional options at bottom */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {user ? (
            <>
              <Button
                variant="text"
                startIcon={<LockIcon />}
                onClick={handleNavigateToPasswordReset}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  py: 1,
                  px: 2,
                  fontWeight: 400,
                  textTransform: 'none',
                  color: '#666',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateX(4px)',
                    color: '#333'
                  }
                }}
              >
                {t('header.userSidebar.changePassword')}
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                fullWidth
                sx={{
                  borderRadius: '8px',
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#b71c1c',
                    bgcolor: '#ffebee',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(211, 47, 47, 0.2)'
                  }
                }}
              >
                {t('header.userSidebar.signOut')}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={handleNavigateToLogin}
              fullWidth
              sx={{
                borderRadius: '8px',
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: COLORS.primary.main,
                color: 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: COLORS.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 8px ${COLORS.primary.main}40`
                }
              }}
            >
              {t('header.userSidebar.login')}
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default UserSidebar;
