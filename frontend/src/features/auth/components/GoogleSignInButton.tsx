import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = (): Promise<void> => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => Promise<void> | void;
  disabled?: boolean;
  text?: GoogleButtonConfiguration['text'];
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onCredential,
  disabled = false,
  text = 'continue_with',
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleCallback = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setError(t('auth.google.invalidCredential'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onCredential(response.credential);
    } catch (callbackError) {
      setError(t('auth.google.loginError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [onCredential, t]);

  useEffect(() => {
    let cancelled = false;

    const initGoogleButton = async () => {
      if (!clientId) {
        setError(t('auth.google.missingClientId'));
        return;
      }

      try {
        await loadGoogleScript();

        if (cancelled || !containerRef.current || !window.google?.accounts?.id) {
          return;
        }

        containerRef.current.innerHTML = '';
        const buttonWidth = Math.min(Math.max(containerRef.current.clientWidth || 280, 240), 360);
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            void handleGoogleCallback(response);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          width: buttonWidth,
          logo_alignment: 'left',
        });
      } catch (loadError) {
        setError(t('auth.google.loadError'));
      }
    };

    void initGoogleButton();

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [clientId, handleGoogleCallback, t, text]);

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ opacity: disabled || isSubmitting ? 0.6 : 1, pointerEvents: disabled || isSubmitting ? 'none' : 'auto' }}>
        <Box ref={containerRef} />
      </Box>

      {isSubmitting && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          {t('common.loading')}
        </Typography>
      )}
    </Box>
  );
};

export default GoogleSignInButton;
