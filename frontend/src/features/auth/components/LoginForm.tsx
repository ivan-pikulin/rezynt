import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../shared/services/api';
import { tokenService } from '../../../shared/services/api/tokenService';
import { LoginCredentials } from '../types/auth';
import { useAuthContext } from '../../../shared/contexts/AuthContext';
import GradientSpinnerAnimation from '../../../shared/components/GradientSpinnerAnimation';
import { yandexMetrikaService } from '../../../shared/services/yandexMetrikaService';
import GoogleSignInButton from './GoogleSignInButton';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onSwitchToPasswordReset: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup, onSwitchToPasswordReset }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthContext();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Check if there's a password reset success message
  const passwordResetSuccess = searchParams.get('message') === 'password_reset_success';

  const validationSchema = yup.object({
    username: yup
      .string()
      .email(t('auth.login.invalidEmail'))
      .required(t('auth.login.emailRequired')),
    password: yup
      .string()
      .required(t('auth.login.passwordRequired')),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values: LoginCredentials) => {
      setIsLoading(true);
      setError('');
      
      try {
        const tokens = await authApi.login(values);
        login(tokens);
        
        // Invalidate resume cache to force fresh data load
        queryClient.invalidateQueries({ queryKey: ['resume'] });
        
        // Track successful login
        yandexMetrikaService.trackLogin('email');
        
        onSuccess();
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.response?.data?.detail || t('auth.login.loginError'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true);
    setError('');

    try {
      const guestId = tokenService.getGuestId();
      const tokens = await authApi.loginWithGoogle({
        id_token: idToken,
        guest_id: guestId || undefined,
      });

      login(tokens);
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      yandexMetrikaService.trackLogin('google');
      onSuccess();
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.response?.data?.detail || t('auth.google.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      {passwordResetSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('auth.login.passwordResetSuccess')}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        fullWidth
        id="username"
        name="username"
        label={t('auth.login.email')}
        autoComplete="email"
        autoFocus
        value={formik.values.username}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
        disabled={isLoading}
      />
      
      <TextField
        margin="normal"
        fullWidth
        name="password"
        label={t('auth.login.password')}
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        disabled={isLoading}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  disabled={isLoading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
      >
        {isLoading ? <GradientSpinnerAnimation size={24} /> : t('auth.login.submit')}
      </Button>

      <Divider sx={{ mb: 2 }}>{t('auth.google.orContinueWith')}</Divider>
      <GoogleSignInButton onCredential={handleGoogleLogin} disabled={isLoading} text="continue_with" />
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('auth.login.noAccount')}{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToSignup}
            sx={{ cursor: 'pointer' }}
          >
            {t('auth.login.signup')}
          </Link>
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {t('auth.login.forgotPassword')}{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToPasswordReset}
            sx={{ cursor: 'pointer' }}
          >
            {t('auth.login.resetPassword')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
