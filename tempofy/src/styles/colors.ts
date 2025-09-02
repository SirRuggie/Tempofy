export const Colors = {
  // Background colors
  background: {
    primary: '#0F172A',
    secondary: '#1E1B4B', 
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
    glass: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(0, 0, 0, 0.3)'
  },

  // Text colors
  text: {
    primary: '#F8FAFC',
    secondary: 'rgba(248, 250, 252, 0.8)',
    tertiary: 'rgba(248, 250, 252, 0.6)',
    muted: 'rgba(248, 250, 252, 0.4)'
  },

  // Tempo colors
  tempo: {
    allegro: {
      primary: '#FF6B35',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      glow: 'rgba(255, 107, 53, 0.3)'
    },
    moderato: {
      primary: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      glow: 'rgba(6, 182, 212, 0.3)'
    },
    adagio: {
      primary: '#A78BFA',
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      glow: 'rgba(167, 139, 250, 0.3)'
    }
  },

  // Priority colors
  priority: {
    forte: '#FF6B6B',
    mezzoForte: '#FFA726',
    mezzo: '#42A5F5',
    mezzoPiano: '#66BB6A',
    piano: '#AB47BC'
  },

  // Accent colors
  accent: {
    golden: '#FCD34D',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  // UI elements
  ui: {
    border: 'rgba(255, 255, 255, 0.1)',
    borderActive: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.25)',
    glow: 'rgba(255, 255, 255, 0.1)'
  }
};

export const GlassMorphism = {
  backdrop: {
    backgroundColor: Colors.background.glass,
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  
  card: {
    backgroundColor: Colors.background.glass,
    backdropFilter: 'blur(16px)',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },

  button: {
    backgroundColor: Colors.background.glass,
    backdropFilter: 'blur(12px)',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  }
};

export const Typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  
  heading2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    letterSpacing: -0.2,
  },
  
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.tertiary,
    lineHeight: 20,
  },
  
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  }
};

export const Animations = {
  scale: {
    in: { transform: [{ scale: 0.95 }] },
    out: { transform: [{ scale: 1 }] }
  },
  
  fade: {
    in: { opacity: 0 },
    out: { opacity: 1 }
  },
  
  slide: {
    up: { transform: [{ translateY: 20 }], opacity: 0 },
    down: { transform: [{ translateY: 0 }], opacity: 1 }
  }
};