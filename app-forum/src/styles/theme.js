// src/styles/theme.js

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints para responsividade
const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

// Cores do tema - Paleta luxuosa e premium
const colors = {
  // Cores primárias - Tons de azul profundo/índigo
  primary: '#3B82F6',         // Azul vibrante
  primaryLight: '#DBEAFE',    // Azul muito claro para fundos
  primaryDark: '#1D4ED8',     // Azul escuro para elementos interativos
  
  // Cores secundárias - Tons sofisticados
  secondary: '#6366F1',       // Índigo moderno
  secondaryLight: '#EEF2FF',  // Índigo claro
  secondaryDark: '#4338CA',   // Índigo escuro
  
  // Cores de status
  success: '#059669',         // Verde esmeralda
  danger: '#DC2626',          // Vermelho elegante
  warning: '#D97706',         // Âmbar refinado
  info: '#0891B2',            // Ciano profundo
  
  // Cores neutras
  black: '#0F172A',           // Quase preto (slate-900)
  white: '#FFFFFF',
  
  // Tons de cinza - escala de slate (mais sofisticada)
  gray100: '#F8FAFC',
  gray200: '#F1F5F9',
  gray300: '#E2E8F0',
  gray400: '#CBD5E1',
  gray500: '#94A3B8',
  gray600: '#64748B',
  gray700: '#475569',
  gray800: '#334155',
  gray900: '#1E293B',
  
  // Cores de texto
  text: '#0F172A',           // Texto mais escuro (slate-900)
  textLight: '#475569',      // Texto secundário (slate-700)
  textMuted: '#64748B',      // Texto terciário (slate-600)
  
  // Cores de fundo
  background: '#F8FAFC',     // Fundo suave (slate-50)
  card: '#FFFFFF',
  
  // Cores de borda
  border: '#E2E8F0',         // slate-200
  borderLight: '#F1F5F9',    // slate-100
  
  // Cores de destaque
  accent: '#8B5CF6',         // Violeta para elementos de destaque
  accentLight: '#EDE9FE',    // Violeta claro
  
  // Cores premium adicionais
  gold: '#F59E0B',           // Dourado premium
  goldLight: '#FEF3C7',      // Dourado claro
  
  // Gradientes pré-definidos (para uso com LinearGradient)
  gradients: {
    primary: ['#3B82F6', '#1D4ED8'],
    secondary: ['#6366F1', '#4338CA'],
    accent: ['#8B5CF6', '#6D28D9'],
    gold: ['#F59E0B', '#D97706'],
  }
};

// Tipografia
const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
    jumbo: 48,
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
    // Podemos adicionar fontes personalizadas depois
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeights: {
    thin: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.5,
  }
};

// Espaçamento
const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Bordas
const borders = {
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 100,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
};

// Sombras - estilo moderno
const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  focused: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 7,
  },
};

// Animações
const animations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    // Estes são valores de referência para uso com Animated.timing
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
  }
};

// Estilos de layout comuns
const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadding: {
    padding: spacing.md,
  },
  safePadding: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borders.radius.lg,
    padding: spacing.md,
    ...shadows.md,
    marginBottom: spacing.md,
  },
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    ...shadows.lg,
    marginBottom: spacing.md,
  },
  surface: {
    backgroundColor: colors.card,
    borderRadius: borders.radius.md,
    padding: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    width: '100%',
  },
  avatar: {
    small: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    medium: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    large: {
      width: 72,
      height: 72,
      borderRadius: 36,
    },
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

// Helpers para responsividade
const isSmallScreen = width < breakpoints.tablet;
const isMediumScreen = width >= breakpoints.tablet && width < breakpoints.desktop;
const isLargeScreen = width >= breakpoints.desktop;

const responsive = {
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  screenWidth: width,
  screenHeight: height,
};

// Utilidades
const utils = {
  opacity: {
    disabled: 0.5,
    subtle: 0.8,
    medium: 0.5,
    light: 0.2,
  },
  zIndex: {
    base: 0,
    elevated: 1,
    dropdown: 10,
    sticky: 100,
    drawer: 200,
    modal: 300,
    toast: 400,
  }
};

// Exporta o tema completo
export default {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  animations,
  layout,
  responsive,
  breakpoints,
  utils,
};
