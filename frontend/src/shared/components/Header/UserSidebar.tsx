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
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { userApi } from '../../services/api/userApi';
import { User } from '../../services/api/types';

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
              bgcolor: '#1976d2',
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

        {/* Навигация */}
        <List sx={{ mb: 2 }}>
          <ListItem 
            button 
            onClick={handleNavigateToResumes}
            sx={{
              borderRadius: '8px',
              mb: 1,
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <DescriptionIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="My Resumes" 
              primaryTypographyProps={{
                fontWeight: 500,
                color: '#2c3e50'
              }}
            />
          </ListItem>
        </List>

        {/* Spacer для выталкивания кнопки выхода вниз */}
        <Box sx={{ flex: 1 }} />

        {/* Кнопка выхода внизу */}
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
    </Drawer>
  );
};

export default UserSidebar;
