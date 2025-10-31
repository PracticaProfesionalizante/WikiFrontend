/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      animation: {
        'slideInRight': 'slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards',
        'logoGlow': 'logoGlow 3s ease-in-out infinite alternate',
        'successPulse': 'successPulse 0.6s ease-out',
        'fadeInStudentImage': 'fadeInStudentImage 1s ease-out 0.5s forwards',
        'bounceIn': 'bounceIn 0.6s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'fadeIn': 'fadeIn 1s ease-out 0.1s forwards',
      },
      keyframes: {
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(50px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        logoGlow: {
          '0%': { opacity: '0.4', transform: 'scale(0.95)' },
          '100%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        successPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeInStudentImage: {
          'from': { opacity: '0' },
          'to': { opacity: '0.95' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}



