import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Link as MuiLink, Alert, IconButton, InputAdornment } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import CommonDialog from 'shared/components/ui/CommonDialog';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ParticlesBackground from '../components/ParticlesBackground';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <ParticlesBackground />
      <CommonDialog
        open={true}
        onClose={() => {}}
        showCloseButton={false}
        maxWidth="xs"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            pt: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              mb: 3,
              color: 'white',
              textShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          >
            {t('login.title')}
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label={t('login.username')}
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
              className="auth-input"
            />
            <TextField
              label={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              className="auth-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Alert 
                severity="error" 
                className="auth-alert"
                sx={{ mt: 2 }}
              >
                {error.message}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              className="auth-submit"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('login.button')}
            </Button>
          </form>
          <Typography sx={{ mt: 2, textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            {t('login.no_account')}{' '}
            <MuiLink
              component={Link}
              to="/signup"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  color: 'primary.dark',
                  textDecoration: 'none',
                },
              }}
            >
              {t('login.signup_link')}
            </MuiLink>
          </Typography>
        </Box>
      </CommonDialog>
    </>
  );
};

export default Login;