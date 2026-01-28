// Color palette matching the web app's design
export const colors = {
    // Primary colors - EV gradient inspired
    primary: '#10B981', // Emerald green
    primaryDark: '#059669',
    primaryLight: '#34D399',
    primaryForeground: '#FFFFFF',

    // Background
    background: '#FFFFFF',
    backgroundDark: '#0F172A',
    card: '#FFFFFF',
    cardDark: '#1E293B',

    // Text colors
    foreground: '#0F172A',
    foregroundDark: '#F8FAFC',
    muted: '#64748B',
    mutedForeground: '#94A3B8',

    // Border
    border: '#E2E8F0',
    borderDark: '#334155',

    // Secondary
    secondary: '#F1F5F9',
    secondaryDark: '#334155',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Gradient
    gradientStart: '#10B981',
    gradientEnd: '#059669',
};

// Spacing scale
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Font sizes
export const fontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
};

// Border radius
export const borderRadius = {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
};

// Shadow styles
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 5,
    },
};
