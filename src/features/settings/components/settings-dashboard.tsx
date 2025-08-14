'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
} from 'lucide-react'
import { BackendUser } from '@/types/auth'
import { ProfileEditForm } from './profile-edit-form'
import { ChangePasswordForm } from './change-password-form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SettingsDashboardProps {
  userData: BackendUser
}

export function SettingsDashboard({ userData }: SettingsDashboardProps) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Configuración</h1>
          <p className='text-muted-foreground'>
            Gestiona tu perfil, contraseña y preferencias del sistema
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='profile'>Perfil</TabsTrigger>
          <TabsTrigger value='security'>Seguridad</TabsTrigger>
          <TabsTrigger value='notifications'>Notificaciones</TabsTrigger>
          <TabsTrigger value='appearance'>Apariencia</TabsTrigger>
          <TabsTrigger value='data'>Datos</TabsTrigger>
          <TabsTrigger value='advanced'>Avanzado</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='space-y-4'>
          <ProfileEditForm
            userData={userData}
            onSuccess={() => {
              console.log('Profile updated successfully')
            }}
          />
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <ChangePasswordForm
            onSuccess={() => {
              console.log('Password changed successfully')
            }}
          />

          {/* Información adicional de seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Configuraciones adicionales para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='text-sm font-medium'>
                      Verificación de Email
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Estado de verificación de tu correo electrónico
                    </div>
                  </div>
                  <Badge
                    variant={userData.emailVerified ? 'default' : 'secondary'}
                  >
                    {userData.emailVerified ? 'Verificado' : 'No Verificado'}
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='text-sm font-medium'>
                      Autenticación de Dos Factores
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Agrega una capa extra de seguridad a tu cuenta
                    </div>
                  </div>
                  <Badge variant='outline'>Próximamente</Badge>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='text-sm font-medium'>Sesiones Activas</div>
                    <div className='text-sm text-muted-foreground'>
                      Gestiona las sesiones activas en tus dispositivos
                    </div>
                  </div>
                  <Button size='sm' variant='outline' disabled>
                    Ver Sesiones
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Preferencias de Notificación
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Alert>
                <Bell className='h-4 w-4' />
                <AlertDescription>
                  Las configuraciones de notificación estarán disponibles
                  próximamente. Por ahora, recibirás notificaciones importantes
                  por email.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='appearance' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Palette className='h-5 w-5' />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Alert>
                <Palette className='h-4 w-4' />
                <AlertDescription>
                  Las opciones de personalización de tema estarán disponibles
                  próximamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='data' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Database className='h-5 w-5' />
                Gestión de Datos
              </CardTitle>
              <CardDescription>
                Exporta o gestiona tus datos personales
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='text-sm font-medium'>Exportar Datos</div>
                    <div className='text-sm text-muted-foreground'>
                      Descarga una copia de tus datos personales
                    </div>
                  </div>
                  <Button size='sm' variant='outline' disabled>
                    <Download className='mr-2 h-4 w-4' />
                    Exportar
                  </Button>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='text-sm font-medium'>Importar Datos</div>
                    <div className='text-sm text-muted-foreground'>
                      Importa datos desde otra fuente
                    </div>
                  </div>
                  <Button size='sm' variant='outline' disabled>
                    <Upload className='mr-2 h-4 w-4' />
                    Importar
                  </Button>
                </div>
              </div>

              <Alert>
                <Database className='h-4 w-4' />
                <AlertDescription>
                  Las funciones de exportación e importación de datos estarán
                  disponibles próximamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='advanced' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
              <CardDescription>
                Opciones avanzadas y acciones administrativas
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='text-sm font-medium'>
                      Información de la Cuenta
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      ID: {userData.id}
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='text-sm font-medium'>Fecha de Registro</div>
                    <div className='text-sm text-muted-foreground'>
                      {new Date(userData.createdAt).toLocaleDateString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='text-sm font-medium'>Último Acceso</div>
                    <div className='text-sm text-muted-foreground'>
                      {userData.lastLoginAt
                        ? new Date(userData.lastLoginAt).toLocaleDateString(
                            'es-ES',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'No disponible'}
                    </div>
                  </div>
                </div>

                <div className='border-t pt-4'>
                  <div className='flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50'>
                    <div>
                      <div className='text-sm font-medium text-red-800'>
                        Zona de Peligro
                      </div>
                      <div className='text-sm text-red-600'>
                        Acciones irreversibles para tu cuenta
                      </div>
                    </div>
                    <Button size='sm' variant='destructive' disabled>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Eliminar Cuenta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
