import { DoctorsList } from '@/features/doctors/components/doctors-list'

export default function DoctorsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Doctores</h1>
        <p className='text-muted-foreground'>
          Gestiona todos los doctores del sistema
        </p>
      </div>

      <DoctorsList />
    </div>
  )
}
