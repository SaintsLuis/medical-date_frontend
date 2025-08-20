# Medical Date Frontend

Panel de administración web completo para la gestión médica, desarrollado con Next.js 15 y React 19. Proporciona una interfaz moderna y eficiente para administradores, médicos y secretarias para gestionar citas, pacientes, registros médicos, facturación y más.

## 🚀 Características Principales

### 🔐 Sistema de Autenticación

- **Login diferenciado** para administradores, médicos y secretarias
- **Gestión de sesiones** con JWT tokens
- **Middleware de protección** de rutas
- **Persistencia de estado** con Zustand
- **Logout automático** por inactividad

### 📊 Dashboard Administrativo

- **Métricas en tiempo real** del sistema
- **Gráficos interactivos** con Recharts
- **Estadísticas de usuarios**, citas y ingresos
- **Análisis de tendencias** por período
- **KPIs principales** del negocio

### 👥 Gestión de Usuarios

- **CRUD completo** de pacientes, médicos y secretarias
- **Perfiles detallados** con información médica
- **Asignación de roles** y permisos granulares
- **Gestión de especialidades** médicas
- **Filtros y búsqueda** avanzada

### 📅 Gestión de Citas

- **Calendario interactivo** con React Big Calendar
- **Vista de citas** con filtros por estado
- **Gestión de disponibilidad** de médicos
- **Reprogramación** y cancelación de citas
- **Recordatorios automáticos** por email

### 🏥 Gestión de Clínicas

- **Catálogo de clínicas** con información detallada
- **Horarios de funcionamiento** por día
- **Servicios y amenidades** disponibles
- **Coordenadas GPS** para ubicación
- **Asignación de médicos** por clínica

### 💊 Registros Médicos

- **Historial médico completo** por paciente
- **Signos vitales** con métricas detalladas
- **Diagnósticos y tratamientos** categorizados
- **Seguimientos** con fechas programadas
- **Archivos adjuntos** para estudios

### 💰 Sistema de Facturación

- **Gestión de facturas** y pagos
- **Reportes financieros** detallados
- **Estados de pago** en tiempo real
- **Historial de transacciones** completo
- **Métricas de ingresos** por período

### 📈 Analytics y Reportes

- **Dashboard analítico** con métricas clave
- **Reportes personalizables** por fecha
- **Exportación de datos** en múltiples formatos
- **Análisis de tendencias** y patrones
- **KPIs de rendimiento** del sistema

### 🎨 Experiencia de Usuario

- **Interfaz moderna** con diseño responsivo
- **Modo oscuro/claro** automático
- **Animaciones suaves** con Framer Motion
- **Componentes accesibles** con Radix UI
- **Navegación intuitiva** con breadcrumbs

## 🛠️ Tecnologías

### Core Framework

- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para mayor seguridad

### UI y Componentes

- **Tailwind CSS 4** - Framework de estilos utility-first
- **Radix UI** - Componentes de interfaz accesibles
- **Lucide React** - Iconografía moderna
- **Framer Motion** - Animaciones y transiciones
- **Next Themes** - Gestión de temas oscuro/claro

### Estado y Datos

- **Zustand** - Gestión de estado global
- **React Query (TanStack)** - Gestión de estado del servidor
- **React Hook Form** - Formularios y validaciones
- **Zod** - Validación de esquemas

### Navegación y Layout

- **Next.js App Router** - Enrutamiento basado en archivos
- **React Big Calendar** - Componente de calendario
- **DND Kit** - Drag and drop para interfaces
- **CMDK** - Búsqueda de comandos

### APIs y Comunicación

- **Axios** - Cliente HTTP para APIs
- **JS Cookie** - Gestión de cookies
- **Handlebars** - Templates para emails

### Tablas y Datos

- **React Table (TanStack)** - Tablas avanzadas
- **Recharts** - Gráficos y visualizaciones
- **Date-fns** - Manipulación de fechas

### Utilidades

- **Class Variance Authority** - Variantes de componentes
- **CLSX** - Utilidad para clases CSS
- **Tailwind Merge** - Fusión de clases Tailwind
- **Sonner** - Notificaciones toast

## 📋 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **Yarn**
- **Git**

### Para Desarrollo

- **Backend API** funcionando (medical-date_backend)
- **Variables de entorno** configuradas
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/SaintsLuis/medical-date_frontend
cd medical-date_frontend
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Variables de Entorno

````bash
# Copiar archivo de ejemplo y renombrarlo a .env.local
cp .env.example .env.local

### 4. Iniciar el Proyecto

```bash
# Iniciar servidor de desarrollo
npm run dev
````

### 4. Iniciar el Proyecto

```bash
# Desarrollo con Turbopack
npm run dev

# Producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3001`

## 📁 Estructura del Proyecto

```
medical-date_frontend/
├── src/
│   ├── app/                    # Páginas y rutas (Next.js App Router)
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (dashboard)/       # Rutas del dashboard
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── middleware.ts      # Middleware de autenticación
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes de interfaz (Radix UI)
│   │   ├── auth/             # Componentes de autenticación
│   │   ├── dashboard/        # Componentes del dashboard
│   │   └── logo.tsx          # Componente del logo
│   ├── features/             # Funcionalidades organizadas por dominio
│   │   ├── auth/             # Autenticación y autorización
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── appointments/     # Gestión de citas
│   │   ├── patients/         # Gestión de pacientes
│   │   ├── doctors/          # Gestión de médicos
│   │   ├── clinics/          # Gestión de clínicas
│   │   ├── specialties/      # Gestión de especialidades
│   │   ├── medical-records/  # Registros médicos
│   │   ├── billing/          # Facturación y pagos
│   │   ├── prescriptions/    # Prescripciones médicas
│   │   ├── users/            # Gestión de usuarios
│   │   ├── secretaries/      # Gestión de secretarias
│   │   ├── analytics/        # Analytics y reportes
│   │   ├── settings/         # Configuraciones
│   │   └── layout/           # Componentes de layout
│   ├── hooks/                # Custom hooks de React
│   │   ├── api/             # Hooks para APIs
│   │   └── ...              # Otros hooks personalizados
│   ├── lib/                  # Librerías y utilidades
│   │   ├── api/             # Configuración de API
│   │   ├── auth-utils.ts    # Utilidades de autenticación
│   │   ├── constants/       # Constantes de la aplicación
│   │   ├── currency.ts      # Utilidades de moneda
│   │   ├── mock/            # Datos mock para desarrollo
│   │   ├── utils.ts         # Utilidades generales
│   │   └── validations/     # Esquemas de validación
│   ├── providers/           # Providers de React
│   │   └── react-query-provider.tsx
│   ├── store/               # Estado global (Zustand)
│   │   └── auth.ts
│   ├── types/               # Tipos TypeScript
│   ├── config/              # Configuraciones
│   ├── constants/           # Constantes de la aplicación
│   └── utils/               # Utilidades adicionales
├── public/                  # Archivos estáticos
├── docs/                    # Documentación
├── next.config.ts          # Configuración de Next.js
├── tailwind.config.js      # Configuración de Tailwind
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias y scripts
```

## 🔧 Configuración Avanzada

### Configuración de Next.js

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configuraciones específicas
  experimental: {
    // Habilitar características experimentales
  },
  images: {
    // Configuración de optimización de imágenes
  },
  env: {
    // Variables de entorno
  },
}

export default nextConfig
```

### Configuración de Tailwind CSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores personalizada
      },
    },
  },
  plugins: [],
}
```

### Configuración de Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Lógica de autenticación y protección de rutas
}

export const config = {
  matcher: [
    // Rutas que requieren autenticación
  ],
}
```

## 📱 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbopack
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar ESLint

# Utilidades
npm run type-check   # Verificar tipos TypeScript
npm run clean        # Limpiar archivos generados
```

## 🧪 Testing

### Testing Manual

```bash
# Ejecutar en diferentes navegadores
npm run dev
# Abrir http://localhost:3001 en diferentes navegadores
```

### Testing de APIs

```bash
# Verificar conectividad con backend
curl -I http://localhost:3000/api/health
```

### Testing de Componentes

```bash
# Ejecutar tests (si están configurados)
npm test
```

## 📦 Despliegue

### 1. Preparar para Producción

```bash
# Configurar variables de producción
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://api.medical-date.com
```

### 2. Build de Producción

```bash
# Generar build optimizado
npm run build

# Verificar build
npm run start
```

### 3. Despliegue en Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### 4. Despliegue en Otros Servicios

**Netlify:**

```bash
# Configurar build command
npm run build

# Configurar publish directory
.next
```

**Docker:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔒 Seguridad

### Autenticación y Autorización

- **JWT tokens** para autenticación
- **Middleware** de protección de rutas
- **Roles y permisos** granulares
- **Logout automático** por inactividad

### Protección de Datos

- **HTTPS** obligatorio en producción
- **Validación** de entrada de usuario
- **Sanitización** de datos
- **CSRF protection** integrada

### Privacidad

- **GDPR compliance** para datos europeos
- **Consentimiento explícito** para datos médicos
- **Anonimización** de datos cuando sea posible
- **Auditoría** de accesos

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de Build

```bash
# Limpiar cache de Next.js
rm -rf .next
npm run build
```

#### 2. Error de Dependencias

```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
```

#### 3. Error de API

```bash
# Verificar conectividad
curl -I http://localhost:3000/api/health

# Verificar variables de entorno
echo $NEXT_PUBLIC_API_URL
```

#### 4. Error de TypeScript

```bash
# Verificar tipos
npx tsc --noEmit

# Limpiar cache de TypeScript
rm -rf tsconfig.tsbuildinfo
```

#### 5. Error de Tailwind

```bash
# Regenerar CSS
npm run build

# Verificar configuración
npx tailwindcss --help
```

## 📈 Monitoreo y Analytics

### Métricas Disponibles

- **Usuarios activos** por sesión
- **Páginas más visitadas**
- **Tiempo de carga** de componentes
- **Errores de JavaScript** en tiempo real
- **Performance** de la aplicación

### Herramientas de Monitoreo

- **Vercel Analytics** (integrado)
- **Sentry** (opcional)
- **Google Analytics** (opcional)
- **Hotjar** (opcional)

## 🤝 Contribución

### Estándares de Código

- **TypeScript** estricto
- **ESLint** + **Prettier** para formato
- **Conventional Commits** para mensajes
- **Tests** obligatorios para nuevas features

### Flujo de Trabajo

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Desarrollo

- **Componentes**: Usar TypeScript y props tipadas
- **Estados**: Preferir Zustand para estado global
- **APIs**: Usar React Query para cache y sincronización
- **Estilos**: Usar Tailwind CSS con clases utilitarias
- **Navegación**: Usar Next.js App Router
- **Formularios**: Usar React Hook Form + Zod

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Frontend Developer**: [Luis Santos](https://github.com/SaintsLuis)

## 📞 Soporte

Para soporte técnico o preguntas:

- 📧 Email: santosvluism@gmail.com
- 🐛 Issues: [GitHub Issues](link-to-issues)
- 📖 Docs: [Documentation](link-to-docs)

---

**Medical Date Frontend v0.1.0** - Panel de administración web completo para gestión médica 🌐✨

_Última actualización: Agosto 2025_
