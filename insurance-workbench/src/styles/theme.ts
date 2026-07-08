export const colors = {
  primary: '#009DFF',
  primaryHover: 'rgba(0, 157, 255, 0.8)',
  primaryLight: 'rgba(0, 157, 255, 0.1)',
  
  textPrimary: '#2E2F30',
  textSecondary: '#696B6C',
  textDisabled: '#DCDDDE',
  
  border: '#DCDDDE',
  borderHover: '#969798',
  
  error: '#FE4066',
  background: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.3)',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px', 
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.1)', 
  lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
} as const;

export const transitions = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
} as const;
