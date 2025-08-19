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
import authApi from '../authApi';
import { LoginCredentials } from '../types/auth';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

const validationSchema = yup.object({
  username: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .required('Пароль обязателен'),
});

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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
        authApi.storeTokens(tokens);
        onSuccess();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Ошибка входа. Проверьте email и пароль.');
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
        id="username"
        name="username"
        label="Email"
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
        label="Пароль"
        type="password"
        id="password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        disabled={isLoading}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Войти'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Нет аккаунта?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToSignup}
            sx={{ cursor: 'pointer' }}
          >
            Зарегистрироваться
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
