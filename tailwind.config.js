/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#1a2f23',
        cream: '#f5e6d3',
        gold: '#d4af37',
        neonGreen: '#33ff77',
        accent: '#33ff77',
        'light-green': '#2c4c3b',
        'red-500': '#ef4444',
        'model-cold': '#60a5fa', // Light blue
        'model-warm': '#fbbf24', // Yellow
        'model-ready': '#33ff77', // Neon green
      },
      fontFamily: {
        'display': ['Arima', 'cursive'],
        'lobster': ['Lobster', 'cursive'],
        'code': ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      textShadow: {
        'neonGreen': '0 0 10px #33ff77',
        'gold': '0 0 10px #d4af37',
        'cream': '0 0 10px #f5e6d3',
        'accent': '0 0 10px #33ff77',
        'red': '0 0 10px #ef4444',
      },
      boxShadow: {
        'neonGreen': '0 0 10px #33ff77',
        'gold': '0 0 10px #d4af37',
        'cream': '0 0 10px #f5e6d3',
        'accent': '0 0 10px #33ff77',
        'red': '0 0 10px #ef4444',
        'neon': '0 0 10px var(--color-accent), inset 0 0 10px var(--color-accent)',
        'neon-gold': '0 0 10px var(--color-gold), inset 0 0 10px var(--color-gold)',
        'neon-red': '0 0 10px var(--color-red-500), inset 0 0 10px var(--color-red-500)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        glow: {
          'from': {
            textShadow: '0 0 5px #33ff77, 0 0 10px #33ff77, 0 0 15px #33ff77'
          },
          'to': {
            textShadow: '0 0 10px #33ff77, 0 0 20px #33ff77, 0 0 30px #33ff77'
          }
        }
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-accent': {
          textShadow: '0 0 5px #33ff77, 0 0 10px #33ff77, 0 0 20px #33ff77',
        },
        '.text-shadow-gold': {
          textShadow: '0 0 5px #d4af37, 0 0 10px #d4af37, 0 0 20px #d4af37',
        },
        '.text-shadow-cream': {
          textShadow: '0 0 5px #f5e6d3, 0 0 10px #f5e6d3, 0 0 20px #f5e6d3',
        },
        '.text-shadow-red': {
          textShadow: '0 0 5px #ef4444, 0 0 10px #ef4444, 0 0 20px #ef4444',
        },
        '.neon-border': {
          border: '2px solid #33ff77',
          boxShadow: '0 0 10px #33ff77, inset 0 0 10px #33ff77',
        },
        '.neon-border-gold': {
          border: '2px solid #d4af37',
          boxShadow: '0 0 10px #d4af37, inset 0 0 10px #d4af37',
        },
        '.neon-border-red': {
          border: '2px solid #ef4444',
          boxShadow: '0 0 10px #ef4444, inset 0 0 10px #ef4444',
        },
        '.neon-text': {
          color: '#33ff77',
          textShadow: '0 0 5px #33ff77, 0 0 10px #33ff77, 0 0 20px #33ff77',
        },
        '.neon-text-gold': {
          color: '#d4af37',
          textShadow: '0 0 5px #d4af37, 0 0 10px #d4af37, 0 0 20px #d4af37',
        },
        '.neon-text-red': {
          color: '#ef4444',
          textShadow: '0 0 5px #ef4444, 0 0 10px #ef4444, 0 0 20px #ef4444',
        },
        '.conservatory-input': {
          backgroundColor: '#1a2f23',
          color: '#f5e6d3',
          border: '2px solid #33ff77',
          transition: 'all 0.3s ease',
        },
        '.conservatory-input:focus': {
          borderColor: '#d4af37',
          boxShadow: '0 0 10px #d4af37',
          outline: 'none',
        },
      };
      addUtilities(newUtilities, ['hover', 'focus']);
    },
    function({ addBase, theme }) {
      addBase({
        'select': {
          'option:hover': {
            '--tw-bg-opacity': '1',
            'background-color': theme('colors.gold'),
            'color': theme('colors.dark'),
          },
          'option:checked': {
            '--tw-bg-opacity': '1',
            'background-color': theme('colors.gold'),
            'color': theme('colors.dark'),
          },
          'option': {
            'background-color': theme('colors.dark'),
            'color': theme('colors.cream'),
            'padding': '0.5rem',
          }
        }
      });
    }
  ],
};
