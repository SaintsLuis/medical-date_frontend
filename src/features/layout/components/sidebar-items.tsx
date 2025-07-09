'use client'

import Link from 'next/link'
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
import { NavigationItem } from '@/types/navigation'
import { ICON_MAP } from '@/lib/constants/icons'

// Elementos que van directamente a sus rutas (sin agrupar)
const DIRECT_ITEMS = [
  {
    name: 'Dashboard',
    href: '/',
    icon: 'BarChart3',
  },
  {
    name: 'Citas',
    href: '/appointments',
    icon: 'Calendar',
  },
  {
    name: 'Clínicas',
    href: '/clinics',
    icon: 'Building2',
  },
  {
    name: 'Facturación',
    href: '/billing',
    icon: 'CreditCard',
  },
  {
    name: 'Expedientes',
    href: '/medical-records',
    icon: 'FileText',
  },
  {
    name: 'Recetas',
    href: '/prescriptions',
    icon: 'Pill',
  },
  {
    name: 'Analíticas',
    href: '/analytics',
    icon: 'BarChart3',
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: 'Settings',
  },
  {
    name: 'Especialidades',
    href: '/specialties',
    icon: 'Pill',
  },
]

// Elementos agrupados
const GROUPED_ITEMS = [
  {
    title: 'Usuarios',
    icon: 'Users',
    items: [
      {
        name: 'Pacientes',
        href: '/patients',
      },
      {
        name: 'Doctores',
        href: '/doctors',
      },
    ],
  },
]

export function SidebarItems({ items }: { items: NavigationItem[] }) {
  return (
    <>
      {/* Elementos directos */}
      <SidebarGroup>
        <SidebarGroupLabel>Navegación</SidebarGroupLabel>
        <SidebarMenu>
          {DIRECT_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP]
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
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
      {GROUPED_ITEMS.map((group) => {
        const GroupIcon = ICON_MAP[group.icon as keyof typeof ICON_MAP]
        return (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                asChild
                defaultOpen={false}
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
                      {group.items.map((item) => (
                        <SidebarMenuSubItem key={item.name}>
                          <SidebarMenuSubButton asChild>
                            <Link href={item.href}>
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
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
