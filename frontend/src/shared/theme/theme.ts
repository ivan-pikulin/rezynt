import { createTheme, Theme } from '@mui/material/styles';

// Create custom theme with modified breakpoints and components
const theme = createTheme({
  palette: {
    primary: {
      main: '#6b7fd7',
      dark: '#5a6bc8',
      light: '#e3f2fd',
    },
    secondary: {
      main: '#673ab7',
      dark: '#5e35b1',
      light: '#f8fafc',
    },
    success: {
      main: '#4caf50',
      dark: '#2e7d32',
    },
    error: {
      main: '#d32f2f',
    },
  },
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
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
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
    main: '#6b7fd7',      // Unified blue/purple color for buttons and accents
    dark: '#5a6bc8',      // Darker blue for hover states
    light: '#e3f2fd',     // Light blue for backgrounds
    ultraLight: '#eff6ff' // Ultra light blue
  },
  secondary: {
    main: '#673ab7',
    dark: '#5e35b1',
    light: '#f8fafc'
  },
  success: {
    main: '#10b981',      // Green - emerald
    dark: '#059669',
    light: '#d1fae5',
    text: '#065f46'
  },
  upload: {
    main: '#66bb6a',
    dark: '#43a047'
  },
  error: {
    main: '#ef4444',      // Red - modern red
    dark: '#dc2626',
    light: '#fee2e2',
    text: '#991b1b'
  },
  warning: {
    main: '#f59e0b',      // Orange - amber
    dark: '#d97706',
    light: '#fef3c7',
    text: '#92400e'
  },
  yellow: {
    main: '#eab308',      // Yellow - bright
    dark: '#ca8a04',
    light: '#fef9c3',
    text: '#713f12'
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
  },
  button: {
    primary: {
      background: '#6b7fd7',
      backgroundHover: '#5a6bc8',
      backgroundDisabled: '#e5e7eb',
      text: '#ffffff',
      textDisabled: '#9ca3af'
    },
    secondary: {
      background: '#e3f2fd',
      backgroundHover: '#bbdefb',
      text: '#6b7fd7',
      textHover: '#5a6bc8'
    }
  },
  score: {
    excellent: {
      main: '#10b981',    // Green - 90-100
      background: '#d1fae5',
      text: '#065f46'
    },
    strong: {
      main: '#22c55e',    // Light green - 76-89
      background: '#dcfce7',
      text: '#166534'
    },
    good: {
      main: '#eab308',    // Yellow - 61-75
      background: '#fef9c3',
      text: '#713f12'
    },
    fair: {
      main: '#f59e0b',    // Orange - 41-60
      background: '#fef3c7',
      text: '#92400e'
    },
    weak: {
      main: '#ef4444',    // Red - 0-40
      background: '#fee2e2',
      text: '#991b1b'
    }
  },
  severity: {
    high: {
      main: '#ef4444',    // Red
      background: '#fee2e2',
      text: '#991b1b'
    },
    medium: {
      main: '#f59e0b',    // Orange
      background: '#fef3c7',
      text: '#92400e'
    },
    low: {
      main: '#eab308',    // Yellow
      background: '#fef9c3',
      text: '#713f12'
    }
  }
};

// Helper functions for dynamic color selection
export const getScoreColor = (score: number) => {
  if (score >= 90) return COLORS.score.excellent;
  if (score >= 76) return COLORS.score.strong;
  if (score >= 61) return COLORS.score.good;
  if (score >= 41) return COLORS.score.fair;
  return COLORS.score.weak;
};

export const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
  return COLORS.severity[severity];
};

export { COLORS };