import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { COLORS } from '../../../shared/theme/theme';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: COLORS.auth.background,
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      <Container maxWidth="lg" sx={{ height: '100%' }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: '80vh'
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: COLORS.auth.card.background,
              border: `1px solid ${COLORS.auth.card.border}`,
              height: 'fit-content',
              width: '100%',
              maxWidth: '800px'
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: COLORS.primary.main,
                mb: 3
              }}
            >
              {title}
            </Typography>
            {children}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
