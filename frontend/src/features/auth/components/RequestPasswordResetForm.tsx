import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import GradientSpinnerAnimation from '../../../shared/components/GradientSpinnerAnimation';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../shared/services/api';

interface RequestPasswordResetFormProps {
  onBackToLogin: () => void;
}

const RequestPasswordResetForm: React.FC<RequestPasswordResetFormProps> = ({ onBackToLogin }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = yup.object({
    email: yup
      .string()
      .email(t('auth.login.invalidEmail'))
      .required(t('auth.login.emailRequired')),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      try {
        await authApi.requestPasswordReset({ email: values.email });
        setSuccess(t('auth.passwordReset.request.successMessage'));
      } catch (err: any) {
        console.error('Password reset request error:', err);
        setError(t('auth.passwordReset.request.errorMessage'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        {t('auth.passwordReset.request.title')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        {t('auth.passwordReset.request.description')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        fullWidth
        id="email"
        name="email"
        label={t('auth.passwordReset.request.email')}
        autoComplete="email"
        autoFocus
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        disabled={isLoading}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
      >
        {isLoading ? <GradientSpinnerAnimation size={24} /> : t('auth.passwordReset.request.submit')}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('auth.passwordReset.request.backToLogin')}{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onBackToLogin}
            sx={{ cursor: 'pointer' }}
          >
            {t('auth.passwordReset.request.backToLoginLink')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RequestPasswordResetForm;
