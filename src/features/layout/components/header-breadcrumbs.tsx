'use client'

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import React from 'react'

// Mapeo de rutas en español a nombres legibles
const ROUTE_NAMES = {
  'registros-medicos': 'Registros Médicos',
  citas: 'Citas',
  doctores: 'Doctores',
  pacientes: 'Pacientes',
  recetas: 'Recetas',
  clinicas: 'Clínicas',
  secretarias: 'Secretarias',
  especialidades: 'Especialidades',
  usuarios: 'Usuarios',
  facturacion: 'Facturación',
  analiticas: 'Analíticas',
  administracion: 'Administración',
  perfil: 'Perfil',
  configuraciones: 'Configuraciones',
  // Rutas en inglés (para compatibilidad)
  'medical-records': 'Registros Médicos',
  appointments: 'Citas',
  doctors: 'Doctores',
  patients: 'Pacientes',
  prescriptions: 'Recetas',
  clinics: 'Clínicas',
  secretaries: 'Secretarias',
  specialties: 'Especialidades',
  users: 'Usuarios',
  billing: 'Facturación',
  analytics: 'Analíticas',
  admin: 'Administración',
  profile: 'Perfil',
  settings: 'Configuraciones',
} as const

export function HeaderBreadcrumbs() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)

  const breadcrumbs = pathSegments.map((segment, idx) => {
    const href = '/' + pathSegments.slice(0, idx + 1).join('/')

    // Buscar nombre en el mapeo, si no existe usar el formato capitalizado
    const name =
      ROUTE_NAMES[segment as keyof typeof ROUTE_NAMES] ||
      decodeURIComponent(segment.charAt(0).toUpperCase() + segment.slice(1))

    return { name, href }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className='hidden md:block'>
          <BreadcrumbLink href='/'>Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbSeparator className='hidden md:block' />
            <BreadcrumbItem>
              {idx === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.name}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
