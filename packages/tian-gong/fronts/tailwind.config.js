/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn Mono Theme - exact colors from https://www.shadcn.io/theme/mono
        background: "oklch(0.1448 0 0)",
        foreground: "oklch(0.9851 0 0)",
        
        card: {
          DEFAULT: "oklch(0.2134 0 0)",
          foreground: "oklch(0.9851 0 0)",
        },
        
        popover: {
          DEFAULT: "oklch(0.2686 0 0)",
          foreground: "oklch(0.9851 0 0)",
        },
        
        primary: {
          DEFAULT: "oklch(0.5555 0 0)",
          foreground: "oklch(0.9851 0 0)",
          hover: "oklch(0.6281 0 0)",
          active: "oklch(0.4375 0 0)",
        },
        
        secondary: {
          DEFAULT: "oklch(0.2686 0 0)",
          foreground: "oklch(0.9851 0 0)",
          hover: "oklch(0.3407 0 0)",
        },
        
        muted: {
          DEFAULT: "oklch(0.2686 0 0)",
          foreground: "oklch(0.7090 0 0)",
        },
        
        accent: {
          DEFAULT: "oklch(0.3715 0 0)",
          foreground: "oklch(0.9851 0 0)",
        },
        
        destructive: {
          DEFAULT: "oklch(0.7022 0.1892 22.2279)",
          foreground: "oklch(0.9851 0 0)",
        },
        
        border: "oklch(0.3407 0 0)",
        
        input: {
          DEFAULT: "oklch(0.4386 0 0)",
          foreground: "oklch(0.9851 0 0)",
        },
        
        ring: "oklch(0.5555 0 0)",
        
        success: "oklch(0.7077 0.165 173.412)",
        warning: "oklch(0.7692 0.1886 84.429)",
        error: "oklch(0.7022 0.1892 22.2279)",
        info: "oklch(0.6856 0.1944 251.724)",
        
        terminal: {
          bg: "oklch(0.1448 0 0)",
          cursor: "oklch(0.9851 0 0)",
        },
        
        chart: {
          "1": "oklch(0.5555 0 0)",
          "2": "oklch(0.5555 0 0)",
          "3": "oklch(0.5555 0 0)",
          "4": "oklch(0.5555 0 0)",
          "5": "oklch(0.5555 0 0)",
        },
        
        sidebar: {
          DEFAULT: "oklch(0.2046 0 0)",
          foreground: "oklch(0.9851 0 0)",
          primary: "oklch(0.9851 0 0)",
          "primary-foreground": "oklch(0.2046 0 0)",
          accent: "oklch(0.2686 0 0)",
          "accent-foreground": "oklch(0.9851 0 0)",
          border: "oklch(1 0 0)",
          ring: "oklch(0.4386 0 0)",
        },
      },
      
      fontFamily: {
        sans: ["Geist Mono", "Geist", "JetBrains Mono", "SF Mono", "Cascadia Code", "Fira Code", "Consolas", "monospace"],
        mono: ["Geist Mono", "JetBrains Mono", "SF Mono", "Cascadia Code", "Fira Code", "Consolas", "monospace"],
      },
      
      borderRadius: {
        DEFAULT: "0px",
        sm: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        full: "0px",
      },
      
      spacing: {
        "0.25rem": "0.25rem",
      },
      
      boxShadow: {
        glow: "0 0 20px rgba(82, 82, 91, 0.3)",
        "glow-sm": "0 0 10px rgba(82, 82, 91, 0.2)",
      },
    },
  },
  plugins: [],
}
