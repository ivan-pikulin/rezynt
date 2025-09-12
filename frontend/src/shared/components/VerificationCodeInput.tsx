import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Box, TextField, Typography, Button, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const CodeInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const CodeDigitInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    width: '48px',
    height: '56px',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    padding: 0,
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
    '&.Mui-error': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
      },
    },
  },
}));

const TimerButton = styled(Button)(({ theme }) => ({
  minWidth: '120px',
  height: '40px',
  borderRadius: theme.spacing(2.5),
  textTransform: 'none',
  fontWeight: 500,
}));

const BackButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface VerificationCodeInputProps {
  onSubmit: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  onBack: () => void;
  email: string;
  isLoading?: boolean;
  error?: string | null;
  resendCooldown?: number; // in seconds, default 60
  title?: string;
  subtitle?: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  onSubmit,
  onResendCode,
  onBack,
  email,
  isLoading = false,
  error = null,
  resendCooldown = 60,
  title,
  subtitle,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState<string[]>(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit !== '') && !isLoading) {
      const fullCode = newCode.join('');
      onSubmit(fullCode);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // If current input is empty, focus previous input
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      
      // Auto-submit pasted code
      if (!isLoading) {
        onSubmit(pastedData);
      }
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0 || isResending) return;
    
    setIsResending(true);
    try {
      await onResendCode();
      setTimeLeft(resendCooldown);
      setCode(new Array(6).fill('')); // Clear the code inputs
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Failed to resend code:', error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <Box sx={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title || t('auth.verification.title')}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {subtitle || t('auth.verification.subtitle', { email: maskedEmail })}
      </Typography>

      <CodeInputContainer>
        {code.map((digit, index) => (
          <CodeDigitInput
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            variant="outlined"
            inputProps={{
              maxLength: 1,
              'aria-label': `Digit ${index + 1}`,
            }}
            error={!!error}
            disabled={isLoading}
          />
        ))}
      </CodeInputContainer>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('auth.verification.didntReceive')}
        </Typography>
        
        <TimerButton
          variant={timeLeft > 0 ? "outlined" : "contained"}
          onClick={handleResendCode}
          disabled={timeLeft > 0 || isResending}
          color="primary"
        >
          {isResending 
            ? t('auth.verification.sending')
            : timeLeft > 0 
              ? `${t('auth.verification.resendIn')} ${formatTime(timeLeft)}`
              : t('auth.verification.resendCode')
          }
        </TimerButton>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackButton onClick={onBack}>
          ← {t('auth.verification.changeEmail')}
        </BackButton>
        
        <Typography variant="caption" color="text.secondary">
          {t('auth.verification.expiresIn15min')}
        </Typography>
      </Box>
    </Box>
  );
};

export default VerificationCodeInput;
