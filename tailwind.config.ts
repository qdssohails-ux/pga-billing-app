import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          500: '#0b7bdc',
          600: '#0669bd',
          700: '#075793',
          900: '#09375f',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.07)',
      },
    },
  },
  plugins: [],
};

export default config;
