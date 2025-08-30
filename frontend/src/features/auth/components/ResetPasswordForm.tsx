import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../shared/services/api';

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validationSchema = yup.object({
    new_password: yup
      .string()
      .min(8, t('auth.passwordReset.reset.passwordMinLength'))
      .required(t('auth.passwordReset.reset.newPasswordRequired')),
    confirm_password: yup
      .string()
      .oneOf([yup.ref('new_password')], t('auth.passwordReset.reset.passwordsMatch'))
      .required(t('auth.passwordReset.reset.confirmPasswordRequired')),
  });

  const formik = useFormik({
    initialValues: {
      new_password: '',
      confirm_password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      
      try {
        await authApi.resetPassword({
          token: token,
          new_password: values.new_password,
        });
        
        // Redirect to login page with success message
        navigate('/auth/login?message=password_reset_success');
      } catch (err: any) {
        console.error('Password reset error:', err);
        setError(err.response?.data?.detail || t('auth.passwordReset.reset.errorMessage'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        {t('auth.passwordReset.reset.title')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        {t('auth.passwordReset.reset.description')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        fullWidth
        name="new_password"
        label={t('auth.passwordReset.reset.newPassword')}
        type="password"
        id="new_password"
        autoComplete="new-password"
        value={formik.values.new_password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.new_password && Boolean(formik.errors.new_password)}
        helperText={formik.touched.new_password && formik.errors.new_password}
        disabled={isLoading}
      />

      <TextField
        margin="normal"
        fullWidth
        name="confirm_password"
        label={t('auth.passwordReset.reset.confirmPassword')}
        type="password"
        id="confirm_password"
        autoComplete="new-password"
        value={formik.values.confirm_password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
        helperText={formik.touched.confirm_password && formik.errors.confirm_password}
        disabled={isLoading}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : t('auth.passwordReset.reset.submit')}
      </Button>
    </Box>
  );
};

export default ResetPasswordForm;
