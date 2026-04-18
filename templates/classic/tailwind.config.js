/* eslint-disable @typescript-eslint/no-require-imports */
import en from './translations/en.json';
import ja from './translations/ja.json';
import ptBr from './translations/pt_br.json';
import zh from './translations/zh.json';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: [
    'variant',
    ['@media (prefers-color-scheme: dark) {&}', '&.night-mode', '.night-mode &'],
  ],
  content: ['./src/**/*.{ts,tsx}'],
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
  safelist: [
    Array.from({ length: 26 }, (_, i) => `before:content-['${String.fromCharCode(65 + i)}']`),
    ['missedAnswer', 'correctAnswer', 'wrongAnswer']
      .map((key) => [zh, en, ja, ptBr].map((map) => `after:content-['${map[key]}']`))
      .flat(),
  ].flat(),
};
