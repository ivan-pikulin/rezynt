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
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuthContext();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeCount, setResumeCount] = useState<number>(0);

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
      
              // Load resume count for premium users
      if (data.is_premium) {
        try {
          const resumes = await resumeApi.getUserResumes();
          setResumeCount(resumes.length);
        } catch (error) {
          console.error('Error fetching resume count:', error);
        }
      }
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

  const handleNavigateToResumes = () => {
    navigate('/resumes');
    onClose();
  };

  const handleNavigateToPasswordReset = () => {
    navigate('/auth/request-password-reset');
    onClose();
  };

  const handleNavigateToLogin = () => {
    navigate('/auth/login');
    onClose();
  };

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'G';
  };

  const getPlanName = (isPremium: boolean, isAuthenticated: boolean) => {
    if (!isAuthenticated) return 'Guest';
    return isPremium ? 'Premium' : 'Free';
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
            Profile
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
            {userData?.email || user?.email || 'Guest User'}
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
            onClick={handleNavigateToResumes}
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
            My Resumes
            {/* Resume counter for premium users */}
            {(userData?.is_premium ?? user?.is_premium) && resumeCount > 0 && (
              <Badge
                badgeContent={resumeCount}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  '& .MuiBadge-badge': {
                    backgroundColor: COLORS.credits.star,
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    border: '2px solid white'
                  }
                }}
              />
            )}
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
                Change Password
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
                Sign Out
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
              Login
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default UserSidebar;
