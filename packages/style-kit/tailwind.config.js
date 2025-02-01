import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {},
  },
  plugins: [typography],
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) {&}',
      '&.night-mode',
      '.night-mode &',
    ],
  ],
};
