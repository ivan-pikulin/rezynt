import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import GradientSpinnerAnimation from '../../../shared/components/GradientSpinnerAnimation';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../shared/services/api';
import { tokenService } from '../../../shared/services/api/tokenService';
import { SignupCredentials } from '../types/auth';
import { yandexMetrikaService } from '../../../shared/services/yandexMetrikaService';

interface SignupFormProps {
  onSuccess: (email?: string) => void;
  onSwitchToLogin: () => void;
  tempFileId?: string | null;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin, tempFileId }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = yup.object({
    email: yup
      .string()
      .email(t('auth.signup.invalidEmail'))
      .required(t('auth.signup.emailRequired')),
    password: yup
      .string()
      .min(8, t('auth.signup.passwordMinLength'))
      .required(t('auth.signup.passwordRequired')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t('auth.signup.passwordsMatch'))
      .required(t('auth.signup.confirmPasswordRequired')),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values: SignupCredentials) => {
      setIsLoading(true);
      setError('');
      
      try {
        // Get guest_id from localStorage if exists
        const guestId = tokenService.getGuestId();
        
        const signupData = {
          email: values.email,
          password: values.password,
          temp_file_id: tempFileId || undefined,
          guest_id: guestId || undefined
        };
        
        console.log('Sending signup request with data:', signupData);
        
        await authApi.signup(signupData);
        
        // Clear guest_id after successful signup conversion
        if (guestId) {
          tokenService.clearGuestId();
        }
        
        // Track successful signup
        yandexMetrikaService.trackSignUp('email');
        
        onSuccess(values.email);
      } catch (err: any) {
        console.error('Signup error:', err);
        setError(err.response?.data?.detail || t('auth.signup.signupError'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        fullWidth
        id="email"
        name="email"
        label={t('auth.signup.email')}
        autoComplete="email"
        autoFocus
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        disabled={isLoading}
      />
      
      <TextField
        margin="normal"
        fullWidth
        name="password"
        label={t('auth.signup.password')}
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
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
      
      <TextField
        margin="normal"
        fullWidth
        name="confirmPassword"
        label={t('auth.signup.confirmPassword')}
        type={showConfirmPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        disabled={isLoading}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
        {isLoading ? <GradientSpinnerAnimation size={24} /> : t('auth.signup.submit')}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('auth.signup.hasAccount')}{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToLogin}
            sx={{ cursor: 'pointer' }}
          >
            {t('auth.signup.login')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignupForm;
