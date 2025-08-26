import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { authApi } from '../../../shared/services/api';
import { SignupCredentials } from '../types/auth';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли должны совпадать')
    .required('Подтвердите пароль'),
});

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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
        await authApi.signup({
          email: values.email,
          password: values.password
        });
        onSuccess();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Ошибка регистрации. Попробуйте еще раз.');
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
        label="Email"
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
        label="Пароль"
        type="password"
        id="password"
        autoComplete="new-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        disabled={isLoading}
      />
      
      <TextField
        margin="normal"
        fullWidth
        name="confirmPassword"
        label="Подтвердите пароль"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        disabled={isLoading}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Уже есть аккаунт?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToLogin}
            sx={{ cursor: 'pointer' }}
          >
            Войти
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignupForm;
