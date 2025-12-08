export const theme = {
  colors: {
    background: '#0b0f17',
    surface: '#121a28',
    card: '#1c2435',
    cardAlt: '#0f1724',
    accent: '#5ec4ff',
    accentWarm: '#ffb547',
    text: '#f2f5ff',
    muted: '#9fb3c8',
    border: '#2c3b52',
    success: '#4cd964',
    danger: '#ff6b6b',
    shadow: 'rgba(0,0,0,0.25)'
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '18px',
    pill: '999px'
  },
  spacing: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '20px',
    xl: '28px'
  },
  typography: {
    heading: '"DM Sans", "Segoe UI", system-ui, sans-serif',
    body: '"DM Sans", "Segoe UI", system-ui, sans-serif'
  }
};

export function applyTheme(customTheme = theme) {
  const root = document.documentElement;
  Object.entries(customTheme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  Object.entries(customTheme.radii).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  Object.entries(customTheme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--space-${key}`, value);
  });
  root.style.setProperty('--font-heading', customTheme.typography.heading);
  root.style.setProperty('--font-body', customTheme.typography.body);
}
