'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DEMO_PASSWORDS } from '@/config/app'

export function DemoInfo() {
  const [isExpanded, setIsExpanded] = useState(false)

  const demoAccounts = [
    {
      email: 'superadmin@medicaldate.com',
      password: DEMO_PASSWORDS['superadmin@medicaldate.com'],
      role: 'Super Administrador',
      description: 'Acceso completo al sistema',
      color: 'bg-red-100 text-red-800',
    },
    {
      email: 'admin@medicaldate.com',
      password: DEMO_PASSWORDS['admin@medicaldate.com'],
      role: 'Administrador',
      description: 'Gestión de usuarios y clínicas',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      email: 'doctor@medicaldate.com',
      password: DEMO_PASSWORDS['doctor@medicaldate.com'],
      role: 'Doctor',
      description: 'Gestión de pacientes y citas',
      color: 'bg-green-100 text-green-800',
    },
    {
      email: 'patient@medicaldate.com',
      password: DEMO_PASSWORDS['patient@medicaldate.com'],
      role: 'Paciente',
      description: 'Acceso a citas y registros médicos',
      color: 'bg-purple-100 text-purple-800',
    },
  ]

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Cuentas de Prueba</span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Usa estas credenciales para probar diferentes roles en el sistema:
          </p>
          <div className='space-y-3'>
            {demoAccounts.map((account) => (
              <div
                key={account.email}
                className='p-3 border rounded-lg space-y-2'
              >
                <div className='flex items-center justify-between'>
                  <Badge className={account.color}>{account.role}</Badge>
                </div>
                <div className='space-y-1'>
                  <div className='text-sm'>
                    <span className='font-medium'>Email:</span> {account.email}
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Contraseña:</span>{' '}
                    <code className='bg-gray-100 px-1 rounded'>
                      {account.password}
                    </code>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {account.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='text-xs text-muted-foreground border-t pt-2'>
            <strong>Nota:</strong> Estas son cuentas de prueba. En producción,
            estas credenciales no estarán disponibles.
          </div>
        </CardContent>
      )}
    </Card>
  )
}
