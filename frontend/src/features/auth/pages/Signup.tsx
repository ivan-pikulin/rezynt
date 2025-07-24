import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Link as MuiLink, Alert, InputAdornment, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { usePasswordVisibility } from '../hooks/usePasswordVisibility';
import { useTranslation } from 'react-i18next';
import CommonDialog from 'shared/components/ui/CommonDialog';
import ParticlesBackground from '../components/ParticlesBackground';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState<string | null>(null);
  
  const passwordVisibility = usePasswordVisibility();
  const confirmPasswordVisibility = usePasswordVisibility();
  const { signup, loading, error } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(t('signup.error_passwords_mismatch'));
      return;
    }
    setPasswordMismatch(null);
    const response = await signup(username, password);
    if (response?.access_token) {
      navigate('/');
    }
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
            {t('signup.title')}
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label={t('signup.username')}
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
              className="auth-input"
            />
            <TextField
              label={t('signup.password')}
              type={passwordVisibility.showPassword ? 'text' : 'password'}
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
                      aria-label={passwordVisibility.showPassword ? t('signup.hide_password') : t('signup.show_password')}
                      onClick={passwordVisibility.togglePasswordVisibility}
                      onMouseDown={passwordVisibility.handleMouseDownPassword}
                      edge="end"
                      tabIndex={-1}
                    >
                      {passwordVisibility.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={t('signup.confirm_password')}
              type={confirmPasswordVisibility.showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              className="auth-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={confirmPasswordVisibility.showPassword ? t('signup.hide_password') : t('signup.show_password')}
                      onClick={confirmPasswordVisibility.togglePasswordVisibility}
                      onMouseDown={confirmPasswordVisibility.handleMouseDownPassword}
                      edge="end"
                      tabIndex={-1}
                    >
                      {confirmPasswordVisibility.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {(passwordMismatch || error) && (
              <Alert 
                severity="error"
                className="auth-alert"
                sx={{ mt: 2 }}
              >
                {passwordMismatch || error?.message}
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
              {loading ? t('common.loading') : t('signup.button')}
            </Button>
          </form>
          <Typography sx={{ mt: 2, textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            {t('signup.have_account')}{' '}
            <MuiLink
              component={Link}
              to="/login"
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
              {t('signup.login_link')}
            </MuiLink>
          </Typography>
        </Box>
      </CommonDialog>
    </>
  );
};

export default Signup; 