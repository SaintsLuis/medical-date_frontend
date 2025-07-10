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
│   ├── api/                     # Clientes API
│   │   ├── client.ts           # Cliente API para Client Components (auto-refresh)
│   │   └── server-client.ts    # Cliente API para Server Actions (auto-refresh)
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

### 2. Sistema de Refresh Token Automático - Arquitectura Completa

#### 2.1. Expiración y Renovación de Tokens

- **Access Token**: Expira en 15 minutos (configurado en backend)
- **Refresh Token**: Expira en 30 días (configurado en backend)
- **Auto-Refresh**: Se ejecuta automáticamente antes de la expiración

#### 2.2. Auto-Refresh en Server Actions (Centralizado)

Se creó un **cliente API centralizado** para Server Actions (`/lib/api/server-client.ts`) que maneja el auto-refresh automáticamente para todas las Server Actions:

```ts
// lib/api/server-client.ts
export async function serverFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies()
  let token = cookieStore.get('access_token')?.value

  // Primera tentativa con el token actual
  let response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}` },
  })

  // Si es 401, intentar refresh automáticamente
  if (response.status === 401) {
    console.log('🔄 Server API: Token expired, attempting auto-refresh...')

    const refreshResult = await refreshTokenAction()

    if (refreshResult.success && refreshResult.newTokens) {
      console.log('✅ Server API: Auto-refresh successful, retrying request...')

      // Reintentar con el nuevo token
      response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${refreshResult.newTokens.accessToken}`,
        },
      })
    }
  }

  return response
}

// Helpers de conveniencia
export const serverApi = {
  get: <T>(url: string) => serverFetch(url, { method: 'GET' }),
  post: <T>(url: string, data: unknown) =>
    serverFetch(url, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(url: string, data: unknown) =>
    serverFetch(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(url: string) => serverFetch(url, { method: 'DELETE' }),
}
```

#### 2.3. Auto-Refresh en Server Actions (Uso)

Todas las Server Actions ahora usan el cliente centralizado:

```ts
// features/specialties/actions/specialty-actions.ts
'use server'
import { serverApi } from '@/lib/api/server-client'

export async function getSpecialtyStats(): Promise<
  ServerApiResponse<BackendSpecialtyStats>
> {
  // El auto-refresh es completamente transparente
  return serverApi.get<BackendSpecialtyStats>('/specialties/stats')
}

export async function createSpecialtyAction(
  data: CreateSpecialtyData
): Promise<ServerApiResponse<Specialty>> {
  const result = await serverApi.post<Specialty>('/specialties', data)

  if (result.success) {
    revalidatePath('/(dashboard)/specialties')
  }

  return result
}
```

#### 2.4. Auto-Refresh en Cliente (API Calls)

Para Client Components, se mantiene el cliente API original (`/lib/api/client.ts`) con auto-refresh:

```ts
// lib/api/client.ts
class ApiClient {
  async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // 1. Primera tentativa con token actual
    let response = await fetch(url, options)

    // 2. Si 401, intentar refresh automáticamente
    if (response.status === 401) {
      const refreshSuccess = await refreshAuth()
      if (refreshSuccess) {
        // 3. Reintentar request original
        response = await fetch(url, options)
      }
    }

    return response
  }
}
```

#### 2.5. Verificaciones Periódicas

```ts
// components/auth/auth-provider.tsx
export function AuthProvider({ children }) {
  useEffect(() => {
    // Verificar auth cada 10 minutos (antes de expiración de 15 min)
    const interval = setInterval(() => {
      checkAuth() // Incluye auto-refresh si es necesario
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // También verificar en eventos:
  // - focus de ventana
  // - reconexión a internet
  // - cambio de ruta
}
```

#### 2.6. Hooks para API con Auto-Refresh

```ts
// hooks/api/use-api.ts
export function useApiCall() {
  const execute = async (apiCall) => {
    try {
      return await apiCall()
    } catch (error) {
      // Si es error de autenticación, manejar automáticamente
      if (isAuthError(error)) {
        clearAuth()
        router.push('/login')
      }
      throw error
    }
  }

  return { get, post, put, delete: del }
}
```

### 3. Flujo de Logout Seguro

- El logout se realiza mediante una **Server Action** (`logoutAction`):
  - Elimina las cookies HTTP-only.
  - Redirige a `/login` usando `redirect('/login', RedirectType.replace)`.
- El cliente limpia el estado global de Zustand.

### 4. Sincronización de Estado (Zustand + Persistencia)

- El store de Zustand (`useAuthStore`) se hidrata:
  - Al iniciar la app (por el `AuthProvider` o un efecto global).
  - Tras login exitoso (llamando a `checkAuth()`).
  - Tras recargar la página (el SSR ya tiene las cookies, el cliente sincroniza el estado).
  - Periódicamente cada 10 minutos.
- El estado se persiste en localStorage bajo la clave `auth-storage`, pero **los tokens nunca se guardan ahí**.
- El método `checkAuth()`:
  - Llama a un Server Action (`getProfileAction`) que lee el token de la cookie y obtiene el perfil del usuario.
  - Si el token es válido, actualiza el estado global y los permisos.
  - Si no, limpia el estado y las cookies.
  - **Incluye auto-refresh automático** si el token está expirado.

### 5. Protección de Rutas (ProtectedRoute)

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

### 6. Server Actions y Seguridad

- Todas las Server Actions deben validar la sesión y los permisos del usuario antes de ejecutar mutaciones.
- Nunca exponer datos sensibles al cliente.
- Usar cookies HTTP-only para tokens.
- **Auto-refresh automático** en todas las Server Actions que requieren autenticación usando el cliente centralizado.
- Seguir las recomendaciones oficiales de Next.js para Server Actions y seguridad:
  - https://nextjs.org/docs/app/guides/authentication

### 7. Manejo de Errores de Autenticación

#### 7.1. En Server Components

```ts
// Server Actions manejan 401 automáticamente con el cliente centralizado
const userData = await getProfileAction() // Auto-refresh incluido
if (!userData) {
  // Usuario no autenticado, redirigir
  redirect('/login')
}
```

#### 7.2. En Client Components

```ts
// Hooks de API manejan 401 automáticamente
const { data, error } = useApiCall()
// Si hay error de auth, el hook redirige automáticamente a /login
```

#### 7.3. Tipos de Refresh

1. **Auto-Refresh Transparente**: Usuario no se da cuenta (token se renueva automáticamente)
2. **Auto-Refresh con Loading**: Breve indicador mientras se renueva el token
3. **Manual Refresh**: Usuario debe reloguearse (solo si refresh token también expiró)

### 8. Configuración de Expiración

```ts
// Tiempos configurados en el sistema:
ACCESS_TOKEN_EXPIRY = 15 minutos   // Configurado en backend
REFRESH_TOKEN_EXPIRY = 30 días     // Configurado en backend
PERIODIC_CHECK_INTERVAL = 10 minutos // Configurado en AuthProvider
RETRY_DELAY = 1 segundo            // Para requests simultáneos
```

### 9. Ventajas del Sistema de Auto-Refresh

#### 9.1. Experiencia de Usuario Mejorada

- **Sin interrupciones**: El usuario nunca se da cuenta de que el token expiró
- **Navegación fluida**: No hay redirects inesperados a login
- **Productividad**: Los usuarios pueden trabajar sin preocuparse por timeouts

#### 9.2. Seguridad Robusta

- **Tokens de corta duración**: Reduce el riesgo si un token es comprometido
- **Renovación automática**: Mantiene sesiones seguras sin intervención manual
- **Cookies HTTP-only**: Los tokens nunca son accesibles desde JavaScript del cliente

#### 9.3. Arquitectura Centralizada

- **Consistencia**: Todos los módulos manejan refresh de la misma manera
- **Mantenibilidad**: Cambios en el sistema de auth se hacen en un solo lugar
- **Escalabilidad**: Fácil agregar nuevos endpoints y módulos

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
- **Auto-Refresh**: Renovación automática de tokens sin interrupciones

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
