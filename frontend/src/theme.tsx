import { createTheme } from '@mui/material/styles'

// Premium Apple-inspired Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#0071e3',
      main: '#0066cc',
      dark: '#004499',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#86868b',
      main: '#1d1d1f',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fbfbfd',
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1f',
      secondary: '#86868b',
    },
    success: {
      main: '#34c759',
    },
    warning: {
      main: '#ff9f0a',
    },
    error: {
      main: '#ff3b30',
    },
    divider: 'rgba(0, 0, 0, 0.06)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.1,
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 980, // Pill shape
          padding: '12px 24px',
          fontSize: '0.9375rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            transform: 'scale(1.02)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#f5f5f7',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0066cc',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
})

export default theme
