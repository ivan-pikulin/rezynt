import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { userApi } from '../../services/api';
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

  useEffect(() => {
    if (open && user && !userData) {
      fetchUserData();
    }
  }, [open, user, userData]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await userApi.getCurrentUser();
      setUserData(data);
      updateUser(data); // Обновляем пользователя в контексте
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

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getPlanName = (isPremium: boolean) => {
    return isPremium ? 'Premium' : 'Free';
  };

  const getPlanColor = (isPremium: boolean) => {
    return isPremium ? 'primary' : 'default';
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
        {/* Заголовок с кнопкой закрытия */}
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

        {/* Информация о пользователе */}
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
            {userData?.email || user?.email}
          </Typography>
          
          <Chip
            icon={(userData?.is_premium || user?.is_premium) ? <StarIcon /> : undefined}
            label={getPlanName(userData?.is_premium || user?.is_premium || false)}
            color={getPlanColor(userData?.is_premium || user?.is_premium || false)}
            variant={(userData?.is_premium || user?.is_premium) ? 'filled' : 'outlined'}
            sx={{ 
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Основная навигация */}
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
          </Button>
        </Box>

        {/* Spacer для выталкивания кнопок вниз */}
        <Box sx={{ flex: 1 }} />

        {/* Дополнительные опции внизу */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)'
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
              '&:hover': {
                borderColor: '#b71c1c',
                bgcolor: '#ffebee'
              }
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default UserSidebar;
