# Arquitectura del Frontend - Medical Date

https://nextjs.org/docs/app/getting-started/project-structure

## Visión General

Este proyecto sigue las mejores prácticas de Next.js 15 con una arquitectura basada en **Server Components** y **features** organizados fuera de la carpeta `app`.

## Estructura del Proyecto

```
src/
├── app/                          # Next.js 15+ App Router (Server Components)
│   ├── (auth)/                   # Route group para autenticación
│   │   ├── layout.tsx           # Layout de autenticación
│   │   └── login/
│   │       └── page.tsx         # Página de login (Server Component)
│   ├── (dashboard)/              # Route group para dashboard
│   │   ├── layout.tsx           # Layout del dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard principal (Server Component)
│   │   └── appointments/
│   │       └── page.tsx         # Página de citas (Server Component)
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout raíz
│   └── page.tsx                 # Página principal
├── features/                     # Features organizados por dominio
│   ├── auth/                    # Feature de autenticación
│   │   ├── components/
│   │   │   └── login-form.tsx   # Formulario de login (Client Component)
│   │   ├── actions/             # Server Actions (login, logout, getProfile)
│   │   ├── store/               # Zustand store para auth
│   │   └── types/
│   ├── dashboard/               # Feature del dashboard
│   │   ├── components/
│   │   │   ├── dashboard-stats.tsx    # Estadísticas (Client Component)
│   │   │   └── dashboard-charts.tsx   # Gráficos (Client Component)
│   ├── appointments/            # Feature de citas
│   │   ├── components/
│   │   │   └── appointments-list.tsx  # Lista de citas (Client Component)
│   └── layout/                  # Feature de layout
│       └── components/
│           ├── dashboard-sidebar.tsx  # Sidebar (Client Component)
│           └── dashboard-header.tsx   # Header (Client Component)
├── components/                   # Componentes UI reutilizables
│   ├── ui/                      # Componentes de Shadcn/UI
│   ├── dashboard/               # Componentes específicos del dashboard
│   └── forms/                   # Formularios reutilizables
├── hooks/                       # Custom hooks
├── lib/                         # Utilidades y configuraciones
├── store/                       # Estado global (Zustand)
├── types/                       # Tipos TypeScript
└── middleware.ts                # Middleware de Next.js
```

## Principios de Arquitectura

### 1. Server Components First

- **Prioridad**: Usar Server Components por defecto
- **Client Components**: Solo cuando sea necesario (eventos, hooks, estado)
- **Directiva**: `'use client'` solo en componentes que lo requieran

### 2. Organización por Features

- **Separación**: Cada feature tiene su propia carpeta con componentes, hooks, servicios y tipos
- **Independencia**: Los features son independientes entre sí
- **Reutilización**: Componentes compartidos en `/components`

### 3. Estructura de Features

```
features/
├── [feature-name]/
│   ├── components/              # Componentes específicos del feature
│   ├── actions/                 # Server Actions (mutaciones y fetch server-side)
│   ├── store/                   # Zustand store
│   ├── types/                   # Tipos específicos del feature
│   └── utils/                   # Utilidades específicas del feature
```

### 4. Separación de Responsabilidades

#### App Router (`/app`)

- **Server Components**: Páginas y layouts que no requieren interactividad
- **Minimal Logic**: Solo lógica de renderizado y routing
- **Data Fetching**: Fetching de datos en el servidor

#### Features (`/features`)

- **Client Components**: Componentes interactivos
- **Business Logic**: Lógica de negocio específica
- **State Management**: Estado local del feature

#### Shared Components (`/components`)

- **UI Components**: Componentes reutilizables de UI
- **Generic Components**: Componentes genéricos sin lógica de negocio

---

## Autenticación y Server Actions (Patrón Oficial)

### 1. Flujo de Login Seguro (Server Actions + Cookies HTTP-only)

- El formulario de login es un **Client Component** (`login-form.tsx`).
- El login se realiza mediante una **Server Action** (`loginAction`):
  - Recibe las credenciales.
  - Llama al backend y obtiene los tokens.
  - Setea las cookies `access_token` y `refresh_token` como **HTTP-only**.
  - Nunca expone los tokens al cliente.
  - Devuelve `{ success: true }` o `{ success: false, error }`.
- Tras login exitoso, el cliente:
  - Llama a `useAuthStore.getState().checkAuth()` para hidratar el estado global y persistirlo en localStorage.
  - Redirige con `router.replace('/')` (SPA, sin recarga completa).

**Ejemplo real:**

```tsx
// features/auth/components/login-form.tsx
const onSubmit = async (data) => {
  setIsSubmitting(true)
  setError('')
  const result = await loginAction(data)
  if (result && !result.success) {
    setError(result.error || 'Error al iniciar sesión')
  } else {
    await useAuthStore.getState().checkAuth()
    router.replace('/')
  }
  setIsSubmitting(false)
}
```

```ts
// features/auth/actions/auth-actions.ts
'use server'
export async function loginAction(formData) {
  // ...fetch al backend...
  // ...set cookies HTTP-only...
  return { success: true }
}
```

### 2. Flujo de Logout Seguro

- El logout se realiza mediante una **Server Action** (`logoutAction`):
  - Elimina las cookies HTTP-only.
  - Redirige a `/login` usando `redirect('/login', RedirectType.replace)`.
- El cliente limpia el estado global de Zustand.

### 3. Sincronización de Estado (Zustand + Persistencia)

- El store de Zustand (`useAuthStore`) se hidrata:
  - Al iniciar la app (por el `AuthProvider` o un efecto global).
  - Tras login exitoso (llamando a `checkAuth()`).
  - Tras recargar la página (el SSR ya tiene las cookies, el cliente sincroniza el estado).
- El estado se persiste en localStorage bajo la clave `auth-storage`, pero **los tokens nunca se guardan ahí**.
- El método `checkAuth()`:
  - Llama a un Server Action (`getProfileAction`) que lee el token de la cookie y obtiene el perfil del usuario.
  - Si el token es válido, actualiza el estado global y los permisos.
  - Si no, limpia el estado y las cookies.

### 4. Protección de Rutas (ProtectedRoute)

- El layout del dashboard y todas las páginas privadas están envueltas en un componente cliente `ProtectedRoute`.
- Si el usuario **no está autenticado** (`isAuthenticated: false`), se redirige automáticamente a `/login`.
- Si está autenticado, se renderiza el contenido.
- El loader se muestra mientras el estado está cargando (`isLoading: true`).
- Se pueden pasar `requiredPermissions` y `requiredRoles` para protección granular.

**Ejemplo:**

```tsx
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      {/* ...layout... */}
      {children}
    </ProtectedRoute>
  )
}
```

```tsx
// components/auth/protected-route.tsx
export function ProtectedRoute({
  children,
  requiredPermissions,
  requiredRoles,
  fallbackPath = '/login',
}) {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuthStore()
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(fallbackPath)
  }, [isAuthenticated, isLoading])
  if (isLoading) return <Loader />
  if (!isAuthenticated) return null
  // ...checks de permisos/roles...
  return <>{children}</>
}
```

### 5. Server Actions y Seguridad

- Todas las Server Actions deben validar la sesión y los permisos del usuario antes de ejecutar mutaciones.
- Nunca exponer datos sensibles al cliente.
- Usar cookies HTTP-only para tokens.
- Seguir las recomendaciones oficiales de Next.js para Server Actions y seguridad:
  - https://nextjs.org/docs/app/guides/authentication

---

## Validación de Datos

### Zod Schemas

```tsx
// lib/validations/appointment.ts
import { z } from 'zod'
export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'El paciente es requerido'),
  doctorId: z.string().min(1, 'El doctor es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  time: z.string().min(1, 'La hora es requerida'),
})
export type AppointmentFormData = z.infer<typeof appointmentSchema>
```

## Estilos y UI

### Tailwind CSS

- **Utility-First**: Usar clases de Tailwind para estilos
- **Responsive**: Diseño mobile-first
- **Dark Mode**: Soporte para modo oscuro

### Shadcn/UI

- **Componentes**: Componentes de UI consistentes
- **Accesibilidad**: Componentes accesibles por defecto
- **Customización**: Fácil personalización con CSS variables

## Testing

### Estructura de Tests

```
__tests__/
├── components/                   # Tests de componentes
├── features/                     # Tests de features
├── hooks/                        # Tests de hooks
└── utils/                        # Tests de utilidades
```

### Herramientas

- **Jest**: Framework de testing
- **React Testing Library**: Testing de componentes
- **MSW**: Mocking de API calls

## Performance

### Optimizaciones

- **Server Components**: Renderizado en servidor
- **Code Splitting**: División automática de código
- **Image Optimization**: Optimización de imágenes con Next.js
- **Caching**: Caching de datos con React Query

## Seguridad

### Autenticación

- **Cookies HTTP-only**: Tokens nunca expuestos al cliente
- **Server Actions**: Todas las mutaciones y fetchs sensibles se hacen en el servidor
- **Protected Routes**: Rutas protegidas con componentes cliente
- **CSRF Protection**: Protección CSRF

### Validación

- **Input Validation**: Validación de entrada con Zod
- **XSS Protection**: Protección contra XSS
- **Content Security Policy**: CSP headers

## Deployment

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.medicaldate.com
NEXT_PUBLIC_APP_URL=https://medicaldate.com
```

### Build Process

```bash
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run dev      # Desarrollo local
```

## Convenciones de Código

### Naming

- **Components**: PascalCase (`DashboardStats`)
- **Files**: kebab-case (`dashboard-stats.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAppointments`)
- **Constants**: UPPER_SNAKE_CASE (`NAVIGATION_ITEMS`)

### Imports

```tsx
// Orden de imports
import React from 'react' // React
import { useRouter } from 'next/navigation' // Next.js
import { Button } from '@/components/ui/button' // UI Components
import { useAuthStore } from '@/features/auth/store/auth' // Store
import { useAppointments } from '@/hooks/api/use-appointments' // Hooks
import { apiClient } from '@/lib/api/client' // Utils
import type { Appointment } from '@/types/appointment' // Types
```

### TypeScript

- **Strict Mode**: TypeScript en modo estricto
- **No Any**: Evitar el uso de `any`
- **Interfaces**: Usar interfaces para tipos de objetos
- **Generics**: Usar genéricos cuando sea apropiado

## Scripts Disponibles

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Consideraciones Futuras

### Escalabilidad

- **Micro-frontends**: Considerar micro-frontends para features grandes
- **Module Federation**: Compartir componentes entre aplicaciones
- **Monorepo**: Estructura de monorepo para múltiples apps

### Performance

- **Streaming**: Server Components con streaming
- **Suspense**: Suspense boundaries para loading states
- **Optimistic Updates**: Actualizaciones optimistas

### Developer Experience

- **Storybook**: Documentación de componentes
- **Plop.js**: Generadores de código
- **Husky**: Git hooks para calidad de código
