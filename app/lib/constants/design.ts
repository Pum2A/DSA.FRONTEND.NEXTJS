export const DESIGN = {
  colors: {
    // Primary brand colors
    primary: {
      DEFAULT: 'hsl(218, 100%, 60%)', // Vibrant blue (Revolut-like)
      50: 'hsl(218, 100%, 97%)',
      100: 'hsl(218, 100%, 94%)',
      200: 'hsl(218, 100%, 89%)',
      300: 'hsl(218, 100%, 80%)',
      400: 'hsl(218, 100%, 70%)',
      500: 'hsl(218, 100%, 60%)', // Default
      600: 'hsl(218, 92%, 50%)',
      700: 'hsl(218, 92%, 40%)',
      800: 'hsl(218, 90%, 30%)',
      900: 'hsl(218, 88%, 20%)',
      950: 'hsl(218, 86%, 12%)',
    },
    // Grayscale
    gray: {
      50: 'hsl(220, 20%, 98%)',
      100: 'hsl(220, 15%, 95%)',
      200: 'hsl(220, 15%, 91%)',
      300: 'hsl(220, 15%, 85%)',
      400: 'hsl(220, 13%, 69%)',
      500: 'hsl(220, 12%, 58%)',
      600: 'hsl(220, 12%, 40%)',
      700: 'hsl(220, 14%, 30%)',
      800: 'hsl(220, 17%, 20%)',
      900: 'hsl(220, 20%, 14%)',
      950: 'hsl(220, 25%, 8%)',
    },
    // Accent colors
    accent: {
      green: {
        DEFAULT: 'hsl(160, 84%, 39%)',
        light: 'hsl(160, 84%, 95%)',
      },
      red: {
        DEFAULT: 'hsl(0, 84%, 60%)',
        light: 'hsl(0, 84%, 95%)',
      },
      yellow: {
        DEFAULT: 'hsl(40, 90%, 50%)',
        light: 'hsl(40, 90%, 95%)',
      },
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
    '3xl': '5rem', // 80px
    page: '1rem',  // Page padding (responsive)
  },
  shadows: {
    sm: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0px 4px 8px rgba(0, 0, 0, 0.08)',
    lg: '0px 8px 16px rgba(0, 0, 0, 0.08)',
    xl: '0px 16px 32px rgba(0, 0, 0, 0.12)',
    inner: 'inset 0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  radius: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px', // Pill shape
  },
  transitions: {
    DEFAULT: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  fontSizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};