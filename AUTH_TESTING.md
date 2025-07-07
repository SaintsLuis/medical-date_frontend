# 🔐 Guía de Pruebas de Autenticación

Esta guía te ayudará a probar el sistema de autenticación sin necesidad de tener el backend conectado.

## 🚀 Configuración Inicial

El sistema está configurado para usar autenticación mock en desarrollo. Esto significa que puedes probar toda la funcionalidad sin necesidad de un backend.

### Configuración Automática

El sistema detecta automáticamente si debe usar autenticación mock basándose en:

- `NODE_ENV === 'development'` (automático en desarrollo)
- `NEXT_PUBLIC_USE_MOCK_AUTH === 'true'` (configuración manual)

## 👥 Cuentas de Prueba Disponibles

### 1. Super Administrador

- **Email:** `superadmin@medicaldate.com`
- **Contraseña:** `superadmin123`
- **Permisos:** Acceso completo al sistema
- **Funcionalidades:** Todas las operaciones del sistema

### 2. Administrador

- **Email:** `admin@medicaldate.com`
- **Contraseña:** `admin123`
- **Permisos:** Gestión de usuarios, clínicas, facturación
- **Funcionalidades:**
  - Crear nuevos usuarios
  - Gestionar doctores y pacientes
  - Ver reportes y analíticas

### 3. Doctor

- **Email:** `doctor@medicaldate.com`
- **Contraseña:** `doctor123`
- **Permisos:** Gestión de pacientes y citas
- **Funcionalidades:**
  - Ver y gestionar citas
  - Acceder a registros médicos
  - Crear prescripciones

### 4. Paciente

- **Email:** `patient@medicaldate.com`
- **Contraseña:** `patient123`
- **Permisos:** Acceso a citas y registros propios
- **Funcionalidades:**
  - Ver citas propias
  - Acceder a registros médicos personales

## 🧪 Cómo Probar

### 1. Acceso al Sistema

1. Ve a `http://localhost:3000/login`
2. Usa cualquiera de las credenciales de prueba
3. Haz clic en "Iniciar Sesión"

### 2. Probar Diferentes Roles

1. **Inicia sesión como Super Admin:**

   - Verás todas las funcionalidades disponibles
   - Puedes crear nuevos usuarios
   - Acceso completo a todas las secciones

2. **Inicia sesión como Admin:**

   - Verás la gestión de usuarios
   - Puedes crear doctores y pacientes
   - Acceso a reportes y analíticas

3. **Inicia sesión como Doctor:**

   - Verás la gestión de citas
   - Acceso a registros médicos
   - Funcionalidades específicas de doctor

4. **Inicia sesión como Paciente:**
   - Verás citas propias
   - Acceso limitado a funcionalidades

### 3. Probar Registro de Usuarios (Solo Admin)

1. Inicia sesión como administrador o super administrador
2. En el dashboard, verás la sección "Registro de Usuarios"
3. Haz clic en "Crear Nuevo Usuario"
4. Completa el formulario con los datos del nuevo usuario
5. El usuario se creará y podrás iniciar sesión con esas credenciales

### 4. Probar Cerrar Sesión

1. En cualquier página del dashboard
2. Busca el botón "Cerrar Sesión" en la información del usuario
3. Haz clic para cerrar sesión
4. Serás redirigido a la página de login

## 🔧 Funcionalidades de Prueba

### Autenticación Mock

- ✅ Login con credenciales predefinidas
- ✅ Registro de nuevos usuarios
- ✅ Verificación de tokens
- ✅ Persistencia de sesión
- ✅ Logout
- ✅ Protección de rutas

### Gestión de Roles y Permisos

- ✅ Verificación de roles
- ✅ Verificación de permisos
- ✅ Acceso condicional a funcionalidades
- ✅ Interfaz adaptativa según rol

### Persistencia de Datos

- ✅ Almacenamiento en localStorage
- ✅ Cookies para middleware
- ✅ Persistencia entre recargas
- ✅ Limpieza al cerrar sesión

## 🐛 Solución de Problemas

### Error: "Credenciales inválidas"

- Verifica que estés usando las credenciales correctas
- Asegúrate de que el email esté escrito correctamente
- Verifica que la contraseña sea exactamente la especificada

### Error: "Token inválido"

- Limpia el localStorage del navegador
- Elimina las cookies del sitio
- Intenta iniciar sesión nuevamente

### No se muestra la información del usuario

- Verifica que hayas iniciado sesión correctamente
- Recarga la página
- Verifica que el token esté presente en las cookies

### No se puede acceder a ciertas rutas

- Verifica que tu rol tenga los permisos necesarios
- Inicia sesión con un usuario con permisos de administrador
- Verifica que la ruta esté correctamente protegida

## 🔄 Cambiar a Backend Real

Cuando estés listo para conectar con el backend real:

1. **Actualiza la configuración:**

   ```typescript
   // En src/config/app.ts
   export const config = {
     USE_MOCK_AUTH: false, // Cambiar a false
     API_BASE_URL: 'http://tu-backend-url.com/api',
   }
   ```

2. **Verifica los endpoints:**

   - `/auth/login` - POST
   - `/auth/register` - POST
   - `/auth/me` - GET

3. **Elimina los archivos mock:**
   - Remueve las credenciales de prueba
   - Elimina los usuarios mock
   - Limpia el código de autenticación mock

## 📝 Notas Importantes

- **Solo para desarrollo:** La autenticación mock solo debe usarse en desarrollo
- **Datos temporales:** Los usuarios creados se almacenan en memoria y se pierden al recargar
- **Sin validación real:** No hay validación de email, fortaleza de contraseña, etc.
- **Sin seguridad:** Los tokens mock no son seguros para producción

## 🎯 Próximos Pasos

1. Prueba todos los roles y funcionalidades
2. Verifica que las rutas estén correctamente protegidas
3. Prueba el registro de usuarios como administrador
4. Verifica la persistencia de sesión
5. Cuando esté listo, conecta con el backend real
