export interface DesignTokens {
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    muted: string;
    border: string;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export function generateTailwindConfig(tokens: DesignTokens): string {
  return `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "${tokens.colors.background}",
        foreground: "${tokens.colors.text}",
        card: {
          DEFAULT: "${tokens.colors.surface}",
          foreground: "${tokens.colors.text}",
        },
        popover: {
          DEFAULT: "${tokens.colors.surface}",
          foreground: "${tokens.colors.text}",
        },
        primary: {
          DEFAULT: "${tokens.colors.primary}",
          foreground: "#ffffff",
          50: "${tokens.colors.primary}10",
          100: "${tokens.colors.primary}20",
          200: "${tokens.colors.primary}30",
          300: "${tokens.colors.primary}40",
          400: "${tokens.colors.primary}60",
          500: "${tokens.colors.primary}",
          600: "${tokens.colors.primary}",
          700: "${tokens.colors.primary}",
          800: "${tokens.colors.primary}",
          900: "${tokens.colors.primary}",
        },
        secondary: {
          DEFAULT: "${tokens.colors.secondary}",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "${tokens.colors.muted}",
          foreground: "${tokens.colors.text}",
        },
        accent: {
          DEFAULT: "${tokens.colors.accent}",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "${tokens.colors.border}",
        input: "${tokens.colors.border}",
        ring: "${tokens.colors.primary}",
      },
      borderRadius: {
        lg: "${tokens.radius.lg}",
        md: "${tokens.radius.md}",
        sm: "${tokens.radius.sm}",
        xl: "${tokens.radius.xl}",
      },
      fontFamily: {
        heading: ["${tokens.typography.heading}", "serif"],
        body: ["${tokens.typography.body}", "sans-serif"],
        mono: ["${tokens.typography.mono}", "monospace"],
      },
      boxShadow: {
        sm: "${tokens.shadows.sm}",
        md: "${tokens.shadows.md}",
        lg: "${tokens.shadows.lg}",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;`;
}

export function generateGlobalCSS(tokens: DesignTokens): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: ${tokens.colors.background};
    --foreground: ${tokens.colors.text};
    --card: ${tokens.colors.surface};
    --card-foreground: ${tokens.colors.text};
    --popover: ${tokens.colors.surface};
    --popover-foreground: ${tokens.colors.text};
    --primary: ${tokens.colors.primary};
    --primary-foreground: #ffffff;
    --secondary: ${tokens.colors.secondary};
    --secondary-foreground: #ffffff;
    --muted: ${tokens.colors.muted};
    --muted-foreground: ${tokens.colors.text};
    --accent: ${tokens.colors.accent};
    --accent-foreground: #ffffff;
    --destructive: #ef4444;
    --destructive-foreground: #ffffff;
    --border: ${tokens.colors.border};
    --input: ${tokens.colors.border};
    --ring: ${tokens.colors.primary};
    --radius: ${tokens.radius.lg};
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-body antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading tracking-tight;
  }

  h1 {
    @apply text-4xl md:text-5xl lg:text-6xl font-bold;
  }

  h2 {
    @apply text-3xl md:text-4xl font-semibold;
  }

  h3 {
    @apply text-2xl md:text-3xl font-semibold;
  }

  p {
    @apply leading-relaxed;
  }

  ::selection {
    background: ${tokens.colors.primary}30;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${tokens.colors.muted};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${tokens.colors.primary};
  }
}

@layer components {
  .glass {
    @apply bg-white/5 backdrop-blur-xl border border-white/10;
  }

  .glass-strong {
    @apply bg-white/10 backdrop-blur-2xl border border-white/20;
  }

  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary;
  }

  .card-hover {
    @apply transition-all duration-300 hover:shadow-lg hover:-translate-y-1;
  }

  .button-glow {
    @apply relative overflow-hidden;
  }

  .button-glow::before {
    content: '';
    @apply absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 transition-opacity duration-300;
  }

  .button-glow:hover::before {
    @apply opacity-100;
  }

  .section-padding {
    @apply px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16;
  }

  .container-custom {
    @apply max-w-7xl mx-auto section-padding;
  }
}

@layer utilities {
  .animation-delay-100 {
    animation-delay: 100ms;
  }
  .animation-delay-200 {
    animation-delay: 200ms;
  }
  .animation-delay-300 {
    animation-delay: 300ms;
  }
  .animation-delay-400 {
    animation-delay: 400ms;
  }
  .animation-delay-500 {
    animation-delay: 500ms;
  }
}`;
}
