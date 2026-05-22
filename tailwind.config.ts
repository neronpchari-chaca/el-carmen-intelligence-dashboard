import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0B1511',
          800: '#10241B',
          700: '#163127',
          500: '#1F6148',
          300: '#61A887',
        },
      },
      boxShadow: {
        premium: '0 12px 35px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
