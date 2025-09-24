// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#2563eb',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#06b6d4',
          success: '#10b981',
          background: '#ffffff',
          surface: '#ffffff',
          'on-background': '#1e293b',
          'on-surface': '#1e293b',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-accent': '#ffffff',
          'on-error': '#ffffff',
          'on-warning': '#ffffff',
          'on-info': '#ffffff',
          'on-success': '#ffffff'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#60a5fa',
          secondary: '#64748b',
          accent: '#60a5fa',
          error: '#f87171',
          warning: '#fbbf24',
          info: '#22d3ee',
          success: '#34d399',
          background: '#0f172a',
          surface: '#1e293b',
          'on-background': '#f8fafc',
          'on-surface': '#f8fafc',
          'on-primary': '#1e293b',
          'on-secondary': '#ffffff',
          'on-accent': '#1e293b',
          'on-error': '#1e293b',
          'on-warning': '#1e293b',
          'on-info': '#1e293b',
          'on-success': '#1e293b'
        }
      }
    }
  }
})
