'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

import { ICON_MAP } from '@/lib/constants/icons'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

// ==============================================
// Configuración de Elementos por Rol
// ==============================================

// Elementos que van directamente a sus rutas (sin agrupar)
const DIRECT_ITEMS = [
  {
    name: 'Panel de gestión',
    href: '/',
    icon: 'BarChart3',
    roles: [UserRole.ADMIN, UserRole.DOCTOR], // Admin, Doctor
  },
  {
    name: 'Citas',
    href: '/citas',
    icon: 'Calendar',
    roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.SECRETARY], // Admin, Doctor y Secretary
  },
  {
    name: 'Clínicas',
    href: '/clinicas',
    icon: 'Hospital',
    roles: [UserRole.ADMIN], // Solo Admin
  },
  {
    name: 'Facturación',
    href: '/facturacion',
    icon: 'CreditCard',
    roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.SECRETARY], // Admin, Doctor y Secretary
  },
  {
    name: 'Registros Médicos',
    href: '/registros-medicos',
    icon: 'FileText',
    roles: [UserRole.ADMIN, UserRole.DOCTOR], // Admin y Doctor
  },
  {
    name: 'Recetas',
    href: '/prescriptions',
    icon: 'Pill',
    roles: [UserRole.ADMIN, UserRole.DOCTOR], // Admin y Doctor
  },
  {
    name: 'Especialidades',
    href: '/especialidades',
    icon: 'HeartPulse',
    roles: [UserRole.ADMIN], // Solo Admin
  },
  // {
  //   name: 'Configuración',
  //   href: '/configuraciones',
  //   icon: 'Settings',
  //   roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.SECRETARY], // Admin, Doctor y Secretary
  // },
]

// Elementos agrupados
const GROUPED_ITEMS = [
  {
    title: 'Usuarios',
    icon: 'Users',
    roles: [UserRole.ADMIN], // Solo Admin
    items: [
      {
        name: 'Gestión de Usuarios',
        href: '/usuarios',
        roles: [UserRole.ADMIN],
      },
      {
        name: 'Pacientes',
        href: '/pacientes',
        roles: [UserRole.ADMIN, UserRole.DOCTOR], // Admin y Doctor
      },
      {
        name: 'Doctores',
        href: '/doctores',
        roles: [UserRole.ADMIN], // Solo Admin
      },
      {
        name: 'Secretarias',
        href: '/secretarias',
        roles: [UserRole.ADMIN], // Solo Admin
      },
    ],
  },
]

// ==============================================
// Funciones de Utilidad
// ==============================================

const hasRole = (userRoles: string[], requiredRoles: UserRole[]): boolean => {
  return userRoles.some((role) => requiredRoles.includes(role as UserRole))
}

const filterItemsByRole = <T extends { roles: UserRole[] }>(
  items: T[],
  userRoles: string[]
): T[] => {
  return items.filter((item) => hasRole(userRoles, item.roles))
}

const isActiveRoute = (pathname: string, href: string): boolean => {
  // Página de inicio exacta
  if (href === '/' && pathname === '/') {
    return true
  }

  // Para otras rutas, verificar si la ruta actual comienza con el href
  if (href !== '/' && pathname.startsWith(href)) {
    return true
  }

  return false
}

// ==============================================
// Componente Principal
// ==============================================

export function SidebarItems() {
  const { user } = useAuthStore()
  const pathname = usePathname()
  const userRoles = user?.roles || []

  // Filtrar elementos directos por rol
  const filteredDirectItems = filterItemsByRole(DIRECT_ITEMS, userRoles)

  // Filtrar elementos agrupados por rol
  const filteredGroupedItems = GROUPED_ITEMS.filter((group) =>
    hasRole(userRoles, group.roles)
  )
    .map((group) => ({
      ...group,
      items: filterItemsByRole(group.items, userRoles),
    }))
    .filter((group) => group.items.length > 0) // Solo mostrar grupos que tengan elementos

  return (
    <>
      {/* Elementos directos */}
      <SidebarGroup>
        <SidebarGroupLabel>Navegación</SidebarGroupLabel>
        <SidebarMenu>
          {filteredDirectItems.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP]
            const isActive = isActiveRoute(pathname, item.href)

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>

      {/* Elementos agrupados */}
      {filteredGroupedItems.map((group) => {
        const GroupIcon = ICON_MAP[group.icon as keyof typeof ICON_MAP]

        // Verificar si algún item del grupo está activo para expandir automáticamente
        const hasActiveItem = group.items.some((item) =>
          isActiveRoute(pathname, item.href)
        )

        return (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                asChild
                defaultOpen={hasActiveItem}
                className='group/collapsible'
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={group.title}>
                      <GroupIcon />
                      <span>{group.title}</span>
                      <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {group.items.map((item) => {
                        const isActive = isActiveRoute(pathname, item.href)

                        return (
                          <SidebarMenuSubItem key={item.name}>
                            <SidebarMenuSubButton asChild isActive={isActive}>
                              <Link href={item.href}>
                                <span>{item.name}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        )
      })}
    </>
  )
}
