// Environment configuration
export const config = {
  // Backend API URL - change this to point to your actual backend
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',

  // Use mock auth in development (set to false when backend is ready)
  USE_MOCK_AUTH:
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true',

  // App settings
  APP_NAME: 'Medical Date',
  APP_DESCRIPTION: 'Comprehensive healthcare management platform',
}

// Mock data passwords for demo accounts (remove in production)
export const DEMO_PASSWORDS = {
  'admin@medicaldate.com': 'admin123',
  'doctor@medicaldate.com': 'doctor123',
  'superadmin@medicaldate.com': 'superadmin123',
  'patient@medicaldate.com': 'patient123',
} as const
