import { createTheme, Theme } from '@mui/material/styles';

// Create custom theme with modified breakpoints and components
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '12px',
          fontWeight: 500,
          borderRadius: '6px',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
  },
});

// Export the theme for use in components
export { theme };

// Basic color constants
const COLORS = {
  chat: {
    bot: {
      avatar: '#c69c72',
      background: '#e3f2fd',
      text: '#1976d2'
    },
    user: {
      avatar: '#ffc857ff',
      background: '#4a5899',
      text: 'white'
    },
    input: {
      background: '#f8f9fa',
      border: '#eee',
      text: '#2c3e50'
    }
  },
  resume: {
    header: {
      background: '#f8fbff',
      text: '#2c3e50'
    },
    section: {
      background: '#f5f6fa',
      border: '#e0e0e0'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d'
    }
  },
  auth: {
    background: '#f5f6fa',
    card: {
      background: '#fafafa',
      border: '#ddd'
    },
    input: {
      background: '#f8f9fa',
      border: '#eee',
      text: '#2c3e50'
    },
    button: {
      background: '#1976d2',
      text: 'white'
    }
  },
  common: {
    border: '#ddd',
    shadow: '#f0f0f0',
    overlay: '#1a1a1a'
  },
  // Additional colors found in the project
  primary: {
    main: '#6b7fd7',
    dark: '#5a6bc8',
    light: '#e3f2fd'
  },
  secondary: {
    main: '#673ab7',
    dark: '#5e35b1',
    light: '#f8fafc'
  },
  success: {
    main: '#4caf50',
    dark: '#2e7d32'
  },
  upload: {
    main: '#66bb6a',
    dark: '#43a047'
  },
  error: {
    main: '#d32f2f'
  },
  warning: {
    main: '#c69c72'
  },
  credits: {
    star: '#ffc857'
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #92bcea 0%, #4a5899 100%)',
    secondary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    white: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
  }
};

export { COLORS };