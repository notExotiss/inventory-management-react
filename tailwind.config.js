/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#f59e0b',
          neutral: '#374151',
          'base-100': '#ffffff',
          'base-200': '#f9fafb',
          'base-300': '#f3f4f6',
          'base-content': '#111827',
        },
        dark: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b',
          neutral: '#374151',
          'base-100': '#1f2937',
          'base-200': '#111827',
          'base-300': '#374151',
          'base-content': '#f9fafb',
        },
      },
    ],
  },
}