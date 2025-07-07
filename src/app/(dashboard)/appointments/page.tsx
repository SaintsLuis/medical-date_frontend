import { AppointmentsList } from '@/features/appointments/components/appointments-list'

export default function AppointmentsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Citas Médicas</h1>
        <p className='text-muted-foreground'>
          Gestiona todas las citas del sistema
        </p>
      </div>

      <AppointmentsList />
    </div>
  )
}
