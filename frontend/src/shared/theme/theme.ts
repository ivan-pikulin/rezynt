import { createTheme, Theme, Components } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { CSSObject } from '@emotion/react';

type StyleObject = CSSObject & {
  [key: string]: any;
};

interface ComponentStyleOverrides {
  root?: StyleObject;
  paper?: StyleObject;
  thumb?: StyleObject;
  rail?: StyleObject;
}

interface CommonComponentsType {
  MuiPaper?: { styleOverrides?: ComponentStyleOverrides };
  MuiButton?: { styleOverrides?: ComponentStyleOverrides };
  MuiCard?: { styleOverrides?: ComponentStyleOverrides };
  MuiAvatar?: { styleOverrides?: ComponentStyleOverrides };
  MuiDialog?: { styleOverrides?: ComponentStyleOverrides };
  MuiAlert?: { styleOverrides?: ComponentStyleOverrides };
  MuiToggleButton?: { styleOverrides?: ComponentStyleOverrides };
  MuiToggleButtonGroup?: { styleOverrides?: ComponentStyleOverrides };
  MuiSlider?: { styleOverrides?: ComponentStyleOverrides };
  MuiIconButton?: { styleOverrides?: ComponentStyleOverrides };
  MuiDialogTitle?: { styleOverrides?: ComponentStyleOverrides };
  MuiDialogContent?: { styleOverrides?: ComponentStyleOverrides };
  MuiDialogActions?: { styleOverrides?: ComponentStyleOverrides };
  MuiTextField?: { styleOverrides?: ComponentStyleOverrides };
}

type NestedCSSObject = CSSObject & {
  [key: string]: CSSObject | string | number | undefined;
};

// Extend Material-UI's theme types
declare module '@mui/material/styles' {
  interface Palette {
    gender: {
      female: {
        background: string;
        border: string;
        active: string;
        text: string;
      };
      male: {
        background: string;
        border: string;
        active: string;
        text: string;
      };
      neutral: {
        background: string;
        border: string;
        active: string;
        text: string;
      };
    };
    familyEdge: {
      start: string;
      middle: string;
      end: string;
    };
    person: {
      deceased: {
        filter: string;
        opacity: number;
      };
    };
    marriage: {
      background: string;
      border: string;
      active: string;
      text: string;
    };
    adminIcon: {
      glow: string;
      border: string;
      shadow: string;
    };
    actionIcons: {
      approve: {
        background: string;
        color: string;
        hover: string;
      };
      reject: {
        background: string;
        color: string;
        hover: string;
      };
    };
  }

  interface PaletteOptions {
    gender: {
      female: {
        background: string;
        border: string;
        active: string;
        text: string;
      };
      male: {
        background: string;
        border: string;
        active: string;
        text: string;
      };
      neutral: {
        background: string;
        border: string;
        active: string;
        text: string;
      };
    };
    familyEdge: {
      start: string;
      middle: string;
      end: string;
    };
    person: {
      deceased: {
        filter: string;
        opacity: number;
      };
    };
    marriage: {
      background: string;
      border: string;
      active: string;
      text: string;
    };
    adminIcon: {
      glow: string;
      border: string;
      shadow: string;
    };
    actionIcons: {
      approve: {
        background: string;
        color: string;
        hover: string;
      };
      reject: {
        background: string;
        color: string;
        hover: string;
      };
    };
  }
}

// Constants
const COLORS = {
  primary: {
    main: '#E07A5F',
    light: '#F2B6A0',
    dark: '#CF6F4B'
  },
  gender: {
    dark: {
      female: {
        background: '#8B4D3A',
        border: '#CF6F4B',
        active: '#E07A5F',
        text: '#FFE4D9'
      },
      male: {
        background: '#2F5A6C',
        border: '#4A7A8C',
        active: '#9FCFDF',
        text: '#E8F6FB'
      },
      neutral: {
        background: '#3E4B53',
        border: '#5C6B74',
        active: '#E07A5F',
        text: '#FFFFFF'
      }
    },
    light: {
      female: {
        background: '#FFC3B0',
        border: '#F2A08A',
        active: '#E07A5F',
        text: '#2A3D45'
      },
      male: {
        background: '#B3D9E6',
        border: '#5C8A99',
        active: '#2A3D45',
        text: '#2A3D45'
      },
      neutral: {
        background: '#EBECED',
        border: '#C3C6CA',
        active: '#E07A5F',
        text: '#2A3D45'
      }
    }
  },
  background: {
    dark: {
      default: '#1F2E34',
      paper: '#2A3D45'
    },
    light: {
      default: '#F6F1ED',
      paper: '#FFFFFF'
    }
  },
  text: {
    dark: {
      primary: '#F6F1ED',
      secondary: '#B3B3B3'
    },
    light: {
      primary: '#2A3D45',
      secondary: '#5C7A89'
    }
  }
};

const TRANSITIONS = {
  default: 'all 0.2s ease-out',
  hover: 'all 0.2s ease-in-out'
};

const SHADOWS = {
  dark: {
    small: '0px 4px 20px rgba(0, 0, 0, 0.2)',
    medium: '0px 6px 24px rgba(0, 0, 0, 0.25)',
    large: '0px 8px 24px rgba(0, 0, 0, 0.3)'
  },
  light: {
    small: '0px 4px 20px rgba(42, 61, 69, 0.08)',
    medium: '0px 6px 24px rgba(42, 61, 69, 0.12)',
    large: '0px 8px 24px rgba(42, 61, 69, 0.15)'
  }
};

// Common component styles
const commonComponents: CommonComponentsType = {
  MuiPaper: {
    styleOverrides: {
      root: {
        '&.admin-panel': {
          borderRadius: '12px',
          transition: TRANSITIONS.default,
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }
      }
    }
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 500,
        padding: '10px 24px',
        transition: TRANSITIONS.hover,
        height: '48px',
        '&:hover': {
          transform: 'translateY(-2px)'
        },
        '&:active': {
          transform: 'translateY(0)'
        },
        '&.auth-submit': {
          backgroundColor: COLORS.primary.main,
          '&:hover': {
            backgroundColor: COLORS.primary.dark
          }
        },
        '&.admin-action': {
          fontSize: '14px',
          fontWeight: 400,
          borderRadius: '8px',
          height: '40px',
          padding: '8px 16px',
          transition: TRANSITIONS.default,
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }
      } as NestedCSSObject
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        transition: 'transform 0.2s ease-out',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }
    }
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        '&.admin': {
          width: '36px',
          height: '36px',
          fontSize: '18px'
        },
        '&.user': {
          width: '40px',
          height: '40px',
          fontSize: '20px'
        }
      }
    }
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '24px',
        overflow: 'hidden',
        '&.auth-dialog': {
          backgroundColor: 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        '&.image-crop-dialog': {
          borderRadius: '24px',
          backgroundColor: 'background.paper',
          backgroundImage: 'none',
          maxHeight: '85vh',
          margin: '12px'
        }
      }
    }
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        animation: 'fadeIn 0.3s ease-in',
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        '&.auth-alert': {
          borderRadius: '8px'
        }
      }
    }
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        border: 'none',
        margin: '0 2px',
        '&.MuiToggleButton-root': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
          }
        }
      }
    }
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        padding: 0
      }
    }
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        '&.image-crop-slider': {
          width: '100%'
        }
      },
      thumb: {
        '.image-crop-slider &': {
          width: 14,
          height: 14,
          backgroundColor: COLORS.primary.main,
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 8px ${COLORS.primary.main}33`
          }
        }
      },
      rail: {
        '.image-crop-slider &': {
          opacity: 0.32
        }
      }
    }
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        '&.image-crop-tool': {
          color: COLORS.primary.main,
          padding: '4px',
          '&:hover': {
            backgroundColor: COLORS.primary.main,
            color: '#fff'
          }
        }
      }
    }
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        '&.image-crop-title': {
          padding: '8px 16px',
          fontSize: '1.1rem',
          minHeight: 40
        }
      }
    }
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        '&.image-crop-content': {
          padding: '8px !important',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: 'calc(100% - 96px)'
        }
      }
    }
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        '&.image-crop-actions': {
          padding: '8px 16px',
          minHeight: 48
        }
      }
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '&.auth-input': {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)'
            }
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)'
          },
          '& .MuiInputBase-input': {
            color: 'white'
          },
          '& .MuiIconButton-root': {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      }
    }
  }
} as const;

// Typography configuration
const typography = {
  fontFamily: 'Inter, sans-serif',
  h1: {
    fontSize: '24px',
    fontWeight: 600
  },
  h2: {
    fontSize: '18px',
    fontWeight: 500
  },
  body1: {
    fontSize: '14px',
    fontWeight: 400
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400
  }
};

// Theme creation utility
const createThemeWithMode = (mode: PaletteMode): Theme => {
  const isDark = mode === 'dark';
  const colors = COLORS.gender[isDark ? 'dark' : 'light'];
  const shadows = SHADOWS[isDark ? 'dark' : 'light'];
  const textColors = COLORS.text[isDark ? 'dark' : 'light'];
  const bgColors = COLORS.background[isDark ? 'dark' : 'light'];

  return createTheme({
    palette: {
      mode,
      background: {
        default: bgColors.default,
        paper: bgColors.paper
      },
      primary: COLORS.primary,
      text: textColors,
      gender: {
        female: colors.female,
        male: colors.male,
        neutral: colors.neutral
      },
      familyEdge: {
        start: COLORS.primary.main,
        middle: '#A2C8D3',
        end: '#8E9DAA'
      },
      person: {
        deceased: {
          filter: isDark ? 'saturate(0.6) brightness(0.6)' : 'saturate(0.5) brightness(0.95)',
          opacity: 0.9
        }
      },
      marriage: {
        background: COLORS.primary.main,
        border: isDark ? COLORS.primary.light : COLORS.primary.dark,
        active: isDark ? COLORS.primary.light : COLORS.primary.dark,
        text: bgColors.paper
      },
      adminIcon: {
        glow: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 200, 0, 0.08)',
        border: isDark ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 180, 0, 0.35)',
        shadow: isDark ? '0 0 12px rgba(255, 215, 0, 0.35)' : '0 0 15px rgba(255, 180, 0, 0.25)'
      },
      actionIcons: {
        approve: {
          background: isDark ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.08)',
          color: isDark ? '#81c784' : '#4caf50',
          hover: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.15)'
        },
        reject: {
          background: isDark ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.08)',
          color: isDark ? '#e57373' : '#f44336',
          hover: isDark ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.15)'
        }
      }
    },
    typography,
    spacing: (factor: number) => `${4 * factor}px`,
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            '&.admin-panel': {
              ...(commonComponents.MuiPaper?.styleOverrides?.root as StyleObject),
              boxShadow: shadows.small,
              '&:hover': {
                boxShadow: shadows.medium
              }
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiButton?.styleOverrides?.root as StyleObject),
            '&.MuiButton-containedPrimary': {
              color: textColors.primary,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 5px 15px rgba(224, 122, 95, 0.3)'
              }
            },
            '&.admin-action': {
              ...(commonComponents.MuiButton?.styleOverrides?.root as StyleObject),
              color: textColors.primary,
              backgroundColor: COLORS.primary.main,
              '&:hover': {
                backgroundColor: COLORS.primary.dark,
                boxShadow: '0 5px 15px rgba(224, 122, 95, 0.3)'
              }
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiCard?.styleOverrides?.root as StyleObject),
            backgroundColor: bgColors.paper,
            boxShadow: shadows.small
          }
        }
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiAvatar?.styleOverrides?.root as StyleObject),
            bgcolor: COLORS.primary.main,
            color: textColors.primary
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            ...(commonComponents.MuiDialog?.styleOverrides?.paper as StyleObject),
            backgroundColor: bgColors.paper,
            backgroundImage: 'none',
            boxShadow: shadows.large,
            '&.image-crop-dialog': {
              '& .image-crop-container': {
                position: 'relative',
                width: '100%',
                height: 360,
                backgroundColor: '#000',
                borderRadius: '16px',
                overflow: 'hidden'
              },
              '& .image-crop-tools': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '6px 16px',
                backgroundColor: bgColors.paper,
                borderRadius: '12px',
                minHeight: 40
              },
              '& .image-crop-zoom-controls': {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                maxWidth: 'calc(100% - 90px)'
              },
              '& .image-crop-rotate-controls': {
                display: 'flex',
                gap: '4px'
              }
            }
          }
        }
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiAlert?.styleOverrides?.root as StyleObject),
            '&.MuiAlert-standardError': {
              backgroundColor: 'rgba(255, 50, 50, 0.15)',
              color: '#ff5252',
              '.MuiAlert-icon': {
                color: '#ff5252'
              }
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: bgColors.paper,
              borderRadius: '8px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.primary.main
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.primary.main
              }
            }
          }
        }
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiToggleButton?.styleOverrides?.root as StyleObject),
            '&.MuiToggleButton-root': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              color: textColors.primary,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
              '&.Mui-selected': {
                backgroundColor: COLORS.primary.main,
                color: '#fff',
                '&:hover': {
                  backgroundColor: COLORS.primary.dark,
                }
              }
            }
          }
        }
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiToggleButtonGroup?.styleOverrides?.root as StyleObject),
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }
        }
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiSlider?.styleOverrides?.root as StyleObject),
            '&.image-crop-slider': {
              '& .MuiSlider-thumb': {
                ...(commonComponents.MuiSlider?.styleOverrides?.root as StyleObject)['& .MuiSlider-thumb'],
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: (theme: Theme) => `0 0 0 8px ${theme.palette.primary.main}33`
                }
              },
              '& .MuiSlider-rail': {
                ...(commonComponents.MuiSlider?.styleOverrides?.root as StyleObject)['& .MuiSlider-rail'],
                opacity: 0.32
              }
            }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiIconButton?.styleOverrides?.root as StyleObject),
            '&.image-crop-tool': {
              ...(commonComponents.MuiIconButton?.styleOverrides?.root as StyleObject),
              color: COLORS.primary.main,
              padding: '4px',
              '&:hover': {
                ...(commonComponents.MuiIconButton?.styleOverrides?.root as StyleObject)['&:hover'],
                backgroundColor: COLORS.primary.main,
                color: '#fff'
              }
            }
          }
        }
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiDialogTitle?.styleOverrides?.root as StyleObject),
            '&.image-crop-title': {
              ...(commonComponents.MuiDialogTitle?.styleOverrides?.root as StyleObject),
              padding: '8px 16px',
              fontSize: '1.1rem',
              minHeight: 40
            }
          }
        }
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiDialogContent?.styleOverrides?.root as StyleObject),
            '&.image-crop-content': {
              ...(commonComponents.MuiDialogContent?.styleOverrides?.root as StyleObject),
              padding: '8px !important',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              height: 'calc(100% - 96px)'
            }
          }
        }
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            ...(commonComponents.MuiDialogActions?.styleOverrides?.root as StyleObject),
            '&.image-crop-actions': {
              ...(commonComponents.MuiDialogActions?.styleOverrides?.root as StyleObject),
              padding: '8px 16px',
              minHeight: 48
            }
          }
        }
      }
    } as Components
  });
};

// Export themes
export const theme = createThemeWithMode('dark');
export const lightTheme = createThemeWithMode('light');