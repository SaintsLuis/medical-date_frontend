import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Mapeo de rutas en español
      {
        source: '/historias-clinicas',
        destination: '/medical-records',
      },
      {
        source: '/historias-clinicas/:path*',
        destination: '/medical-records/:path*',
      },
      {
        source: '/citas',
        destination: '/appointments',
      },
      {
        source: '/citas/:path*',
        destination: '/appointments/:path*',
      },
      {
        source: '/doctores',
        destination: '/doctors',
      },
      {
        source: '/doctores/:path*',
        destination: '/doctors/:path*',
      },
      {
        source: '/pacientes',
        destination: '/patients',
      },
      {
        source: '/pacientes/:path*',
        destination: '/patients/:path*',
      },
      {
        source: '/recetas',
        destination: '/prescriptions',
      },
      {
        source: '/recetas/:path*',
        destination: '/prescriptions/:path*',
      },
      {
        source: '/clinicas',
        destination: '/clinics',
      },
      {
        source: '/clinicas/:path*',
        destination: '/clinics/:path*',
      },
      {
        source: '/secretarias',
        destination: '/secretaries',
      },
      {
        source: '/secretarias/:path*',
        destination: '/secretaries/:path*',
      },
      {
        source: '/especialidades',
        destination: '/specialties',
      },
      {
        source: '/especialidades/:path*',
        destination: '/specialties/:path*',
      },
      {
        source: '/usuarios',
        destination: '/users',
      },
      {
        source: '/usuarios/:path*',
        destination: '/users/:path*',
      },
      {
        source: '/facturacion',
        destination: '/billing',
      },
      {
        source: '/facturacion/:path*',
        destination: '/billing/:path*',
      },
      {
        source: '/analiticas',
        destination: '/analytics',
      },
      {
        source: '/analiticas/:path*',
        destination: '/analytics/:path*',
      },
      {
        source: '/administracion',
        destination: '/admin',
      },
      {
        source: '/administracion/:path*',
        destination: '/admin/:path*',
      },
      {
        source: '/perfil',
        destination: '/profile',
      },
      {
        source: '/perfil/:path*',
        destination: '/profile/:path*',
      },
      {
        source: '/configuraciones',
        destination: '/settings',
      },
      {
        source: '/configuraciones/:path*',
        destination: '/settings/:path*',
      },
    ]
  },
}

export default nextConfig
