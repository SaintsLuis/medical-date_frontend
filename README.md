# Medical Date Frontend

## 🚀 Configuración de Puertos

| Aplicación                 | Puerto   | URL                   |
| -------------------------- | -------- | --------------------- |
| **Frontend Web (Next.js)** | **3001** | http://localhost:3001 |
| **App Mobile (Expo)**      | **3000** | http://localhost:3000 |
| **Backend (NestJS)**       | **3002** | http://localhost:3002 |

## 📋 Scripts Disponibles

```bash
# Desarrollo con puerto personalizado
npm run dev              # Ejecuta en puerto 3001

# Producción
npm run build           # Construir aplicación
npm run start           # Ejecutar en producción (puerto 3001)

# Calidad de código
npm run lint            # Verificar ESLint
```

## 🔧 Variables de Entorno

Crear archivo `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3002/api

# Configuración de autenticación (solo para desarrollo)
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

## 🚀 Inicio Rápido

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Iniciar en desarrollo:**

   ```bash
   npm run dev
   ```

3. **Acceder a la aplicación:**
   - Frontend: http://localhost:3001
   - Login con credenciales reales del backend

## 🏗️ Arquitectura

- **Framework:** Next.js 15 con App Router
- **UI:** Tailwind CSS + Shadcn/UI
- **Estado:** Zustand
- **Consultas:** TanStack Query
- **Autenticación:** Server Actions + Cookies HTTP-only
- **Formularios:** React Hook Form + Zod
